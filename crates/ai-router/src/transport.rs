//! One call to one offer. The request and the answer are OpenAI chat-completions documents; Anthropic messages and
//! Google generateContent are translated both ways. Non-streaming.

use crate::catalog::{Offer, Protocol};
use serde_json::{json, Map, Value};
use std::time::Duration;

/// Outcome of one attempt: the HTTP status (0 when no answer arrived) and the OpenAI-shaped body or an error text.
pub struct Reply {
    pub status: u16,
    pub body: Result<Value, String>,
}

fn agent(timeout: Duration) -> ureq::Agent {
    ureq::Agent::config_builder().timeout_global(Some(timeout)).http_status_as_error(false).build().into()
}

fn post(url: &str, headers: &[(&str, String)], body: &Value, timeout: Duration) -> Reply {
    let mut req = agent(timeout).post(url);
    for (k, v) in headers {
        req = req.header(*k, v);
    }
    match req.send_json(body) {
        Err(e) => Reply { status: 0, body: Err(e.to_string()) },
        Ok(mut res) => {
            let status = res.status().as_u16();
            let text = res.body_mut().with_config().limit(64 * 1024 * 1024).read_to_string().unwrap_or_default();
            if (200..300).contains(&status) {
                Reply { status, body: serde_json::from_str(&text).map_err(|e| format!("invalid JSON answer: {e}")) }
            } else {
                Reply { status, body: Err(text.chars().take(2000).collect()) }
            }
        }
    }
}

pub fn call(offer: &Offer, request: &Value, timeout: Duration) -> Reply {
    let key = offer.credential();
    match offer.protocol {
        Protocol::OpenAi => {
            let mut body = request.clone();
            body["model"] = json!(offer.model);
            body["stream"] = json!(false);
            let mut headers = vec![];
            if let Some(k) = key {
                headers.push(("authorization", format!("Bearer {k}")));
            }
            post(&format!("{}/chat/completions", offer.base_url), &headers, &body, timeout)
        }
        Protocol::Anthropic => {
            let headers = vec![("x-api-key", key.unwrap_or_default()), ("anthropic-version", "2023-06-01".to_owned())];
            let r = post(&format!("{}/messages", offer.base_url), &headers, &to_anthropic(offer, request), timeout);
            Reply { status: r.status, body: r.body.map(|b| from_anthropic(offer, &b)) }
        }
        Protocol::Google => {
            let headers = vec![("x-goog-api-key", key.unwrap_or_default())];
            let url = format!("{}/models/{}:generateContent", offer.base_url, offer.model);
            let r = post(&url, &headers, &to_google(request), timeout);
            Reply { status: r.status, body: r.body.map(|b| from_google(offer, &b)) }
        }
    }
}

fn text_of(content: &Value) -> String {
    match content {
        Value::String(s) => s.clone(),
        Value::Array(parts) => parts.iter().filter_map(|p| p["text"].as_str()).collect::<Vec<_>>().join("\n"),
        _ => String::new(),
    }
}

fn openai_tools(request: &Value) -> Vec<&Value> {
    request["tools"].as_array().map(|t| t.iter().map(|x| &x["function"]).collect()).unwrap_or_default()
}

pub fn to_anthropic(offer: &Offer, request: &Value) -> Value {
    let mut system = Vec::new();
    let mut messages = Vec::new();
    for m in request["messages"].as_array().into_iter().flatten() {
        match m["role"].as_str().unwrap_or("user") {
            "system" | "developer" => system.push(text_of(&m["content"])),
            "tool" => messages.push(json!({ "role": "user", "content": [{ "type": "tool_result", "tool_use_id": m["tool_call_id"], "content": text_of(&m["content"]) }] })),
            "assistant" => {
                let mut blocks = vec![];
                let t = text_of(&m["content"]);
                if !t.is_empty() {
                    blocks.push(json!({ "type": "text", "text": t }));
                }
                for c in m["tool_calls"].as_array().into_iter().flatten() {
                    let input: Value = serde_json::from_str(c["function"]["arguments"].as_str().unwrap_or("{}")).unwrap_or(json!({}));
                    blocks.push(json!({ "type": "tool_use", "id": c["id"], "name": c["function"]["name"], "input": input }));
                }
                messages.push(json!({ "role": "assistant", "content": blocks }));
            }
            _ => messages.push(json!({ "role": "user", "content": text_of(&m["content"]) })),
        }
    }
    let mut body = Map::new();
    body.insert("model".into(), json!(offer.model));
    body.insert("messages".into(), json!(messages));
    body.insert("max_tokens".into(), request["max_tokens"].as_u64().or(request["max_completion_tokens"].as_u64()).map_or(json!(4096), |n| json!(n)));
    if !system.is_empty() {
        body.insert("system".into(), json!(system.join("\n\n")));
    }
    if let Some(t) = request["temperature"].as_f64() {
        body.insert("temperature".into(), json!(t));
    }
    let tools: Vec<Value> = openai_tools(request).into_iter().map(|f| json!({ "name": f["name"], "description": f["description"], "input_schema": f["parameters"] })).collect();
    if !tools.is_empty() {
        body.insert("tools".into(), json!(tools));
    }
    Value::Object(body)
}

pub fn from_anthropic(offer: &Offer, b: &Value) -> Value {
    let blocks = b["content"].as_array().cloned().unwrap_or_default();
    let text: String = blocks.iter().filter(|x| x["type"] == "text").filter_map(|x| x["text"].as_str()).collect::<Vec<_>>().join("");
    let calls: Vec<Value> = blocks
        .iter()
        .filter(|x| x["type"] == "tool_use")
        .map(|x| json!({ "id": x["id"], "type": "function", "function": { "name": x["name"], "arguments": x["input"].to_string() } }))
        .collect();
    let finish = match b["stop_reason"].as_str() {
        Some("max_tokens") => "length",
        Some("tool_use") => "tool_calls",
        _ => "stop",
    };
    let mut message = json!({ "role": "assistant", "content": text });
    if !calls.is_empty() {
        message["tool_calls"] = json!(calls);
    }
    json!({
        "id": b["id"], "object": "chat.completion", "model": offer.model,
        "choices": [{ "index": 0, "message": message, "finish_reason": finish }],
        "usage": { "prompt_tokens": b["usage"]["input_tokens"], "completion_tokens": b["usage"]["output_tokens"] }
    })
}

pub fn to_google(request: &Value) -> Value {
    let mut system = Vec::new();
    let mut contents = Vec::new();
    for m in request["messages"].as_array().into_iter().flatten() {
        match m["role"].as_str().unwrap_or("user") {
            "system" | "developer" => system.push(json!({ "text": text_of(&m["content"]) })),
            "assistant" => {
                let mut parts = vec![];
                let t = text_of(&m["content"]);
                if !t.is_empty() {
                    parts.push(json!({ "text": t }));
                }
                for c in m["tool_calls"].as_array().into_iter().flatten() {
                    let args: Value = serde_json::from_str(c["function"]["arguments"].as_str().unwrap_or("{}")).unwrap_or(json!({}));
                    parts.push(json!({ "functionCall": { "name": c["function"]["name"], "args": args } }));
                }
                contents.push(json!({ "role": "model", "parts": parts }));
            }
            "tool" => contents.push(json!({ "role": "user", "parts": [{ "functionResponse": { "name": m["name"], "response": { "content": text_of(&m["content"]) } } }] })),
            _ => contents.push(json!({ "role": "user", "parts": [{ "text": text_of(&m["content"]) }] })),
        }
    }
    let mut body = json!({ "contents": contents });
    if !system.is_empty() {
        body["systemInstruction"] = json!({ "parts": system });
    }
    let mut generation = Map::new();
    if let Some(t) = request["temperature"].as_f64() {
        generation.insert("temperature".into(), json!(t));
    }
    if let Some(n) = request["max_tokens"].as_u64().or(request["max_completion_tokens"].as_u64()) {
        generation.insert("maxOutputTokens".into(), json!(n));
    }
    if !generation.is_empty() {
        body["generationConfig"] = Value::Object(generation);
    }
    let decls: Vec<Value> = openai_tools(request).into_iter().map(|f| json!({ "name": f["name"], "description": f["description"], "parameters": f["parameters"] })).collect();
    if !decls.is_empty() {
        body["tools"] = json!([{ "functionDeclarations": decls }]);
    }
    body
}

pub fn from_google(offer: &Offer, b: &Value) -> Value {
    let parts = b["candidates"][0]["content"]["parts"].as_array().cloned().unwrap_or_default();
    let text: String = parts.iter().filter_map(|p| p["text"].as_str()).collect::<Vec<_>>().join("");
    let calls: Vec<Value> = parts
        .iter()
        .filter(|p| p.get("functionCall").is_some())
        .enumerate()
        .map(|(i, p)| json!({ "id": format!("call_{i}"), "type": "function", "function": { "name": p["functionCall"]["name"], "arguments": p["functionCall"]["args"].to_string() } }))
        .collect();
    let finish = match b["candidates"][0]["finishReason"].as_str() {
        Some("MAX_TOKENS") => "length",
        _ if !calls.is_empty() => "tool_calls",
        _ => "stop",
    };
    let mut message = json!({ "role": "assistant", "content": text });
    if !calls.is_empty() {
        message["tool_calls"] = json!(calls);
    }
    json!({
        "object": "chat.completion", "model": offer.model,
        "choices": [{ "index": 0, "message": message, "finish_reason": finish }],
        "usage": { "prompt_tokens": b["usageMetadata"]["promptTokenCount"], "completion_tokens": b["usageMetadata"]["candidatesTokenCount"] }
    })
}

/// Streams an OpenAI-compatible chat: `on_chunk` receives each `chat.completion.chunk` document. Offers spoken in
/// another protocol answer in one piece, delivered as a single chunk. Returns the status and, on failure before the
/// first chunk, the error; `Ok(true)` once at least one chunk was delivered.
pub fn stream(offer: &Offer, request: &Value, timeout: Duration, on_chunk: &mut dyn FnMut(&Value)) -> (u16, Result<bool, String>) {
    if offer.protocol != Protocol::OpenAi {
        let r = call(offer, request, timeout);
        return match r.body {
            Err(e) => (r.status, Err(e)),
            Ok(b) => {
                let msg = &b["choices"][0]["message"];
                on_chunk(&json!({ "object": "chat.completion.chunk", "model": offer.model, "choices": [{ "index": 0, "delta": { "role": "assistant", "content": msg["content"], "tool_calls": msg["tool_calls"] }, "finish_reason": b["choices"][0]["finish_reason"] }] }));
                (r.status, Ok(true))
            }
        };
    }
    let mut body = request.clone();
    body["model"] = json!(offer.model);
    body["stream"] = json!(true);
    let mut req = agent(timeout).post(format!("{}/chat/completions", offer.base_url)).header("accept", "text/event-stream");
    if let Some(k) = offer.credential() {
        req = req.header("authorization", format!("Bearer {k}"));
    }
    let mut res = match req.send_json(&body) {
        Err(e) => return (0, Err(e.to_string())),
        Ok(r) => r,
    };
    let status = res.status().as_u16();
    if !(200..300).contains(&status) {
        let text = res.body_mut().read_to_string().unwrap_or_default();
        return (status, Err(text.chars().take(2000).collect()));
    }
    use std::io::BufRead;
    let mut delivered = false;
    for line in std::io::BufReader::new(res.body_mut().as_reader()).lines() {
        let Ok(line) = line else { break };
        let Some(data) = line.strip_prefix("data:").map(str::trim) else { continue };
        if data == "[DONE]" {
            break;
        }
        if let Ok(chunk) = serde_json::from_str::<Value>(data) {
            on_chunk(&chunk);
            delivered = true;
        }
    }
    if delivered { (status, Ok(true)) } else { (status, Err("the stream ended without a chunk".to_owned())) }
}
