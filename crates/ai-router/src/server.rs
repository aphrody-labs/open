//! HTTP service over a router, compatible with OpenAI (`POST /v1/chat/completions`, `GET /v1/models`) and Anthropic
//! (`POST /v1/messages`) clients, plus `GET /health`. One thread per request.

use crate::Router;
use serde_json::{json, Value};
use std::sync::Arc;
use tiny_http::{Header, Method, Response, Server};

fn reply(req: tiny_http::Request, status: u16, body: &Value) {
    let h = Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).expect("static header");
    let _ = req.respond(Response::from_string(body.to_string()).with_status_code(status).with_header(h));
}

/// Serves until the process ends. `addr` like "127.0.0.1:0"; the bound address is returned through `on_ready`.
pub fn serve(router: Router, addr: &str, on_ready: impl FnOnce(String)) -> Result<(), String> {
    let server = Server::http(addr).map_err(|e| format!("{addr}: {e}"))?;
    on_ready(server.server_addr().to_string());
    let router = Arc::new(router);
    for mut req in server.incoming_requests() {
        let router = router.clone();
        std::thread::spawn(move || {
            let path = req.url().split('?').next().unwrap_or("").to_owned();
            match (req.method(), path.as_str()) {
                (Method::Get, "/health") => reply(req, 200, &json!({ "ok": true, "offers": router.models("auto").len() })),
                (Method::Get, "/v1/models") => {
                    let data: Vec<Value> = router.models("auto").iter().map(|o| json!({ "id": o.id(), "object": "model", "owned_by": o.provider, "local": o.local, "zero_cost": o.zero_cost() })).collect();
                    reply(req, 200, &json!({ "object": "list", "data": data }));
                }
                (Method::Post, "/v1/chat/completions") => {
                    let mut text = String::new();
                    let _ = req.as_reader().read_to_string(&mut text);
                    match serde_json::from_str::<Value>(&text) {
                        Err(e) => reply(req, 400, &json!({ "error": { "message": format!("invalid JSON: {e}"), "type": "invalid_request_error" } })),
                        Ok(body) => {
                            let answer = router.chat(&body);
                            let status = if answer.get("error").is_some() { 502 } else { 200 };
                            reply(req, status, &answer);
                        }
                    }
                }
                (Method::Post, "/v1/messages") => {
                    let mut text = String::new();
                    let _ = req.as_reader().read_to_string(&mut text);
                    match serde_json::from_str::<Value>(&text) {
                        Err(e) => reply(req, 400, &json!({ "type": "error", "error": { "type": "invalid_request_error", "message": format!("invalid JSON: {e}") } })),
                        Ok(body) => {
                            let answer = router.chat(&anthropic_to_openai(&body));
                            if answer.get("error").is_some() {
                                reply(req, 502, &json!({ "type": "error", "error": { "type": "api_error", "message": answer["error"]["message"] }, "router": answer["router"] }));
                            } else {
                                reply(req, 200, &openai_to_anthropic(&answer));
                            }
                        }
                    }
                }
                _ => reply(req, 404, &json!({ "error": { "message": "not found", "type": "not_found" } })),
            }
        });
    }
    Ok(())
}

fn blocks_text(content: &Value) -> String {
    match content {
        Value::String(s) => s.clone(),
        Value::Array(b) => b.iter().filter(|x| x["type"] == "text").filter_map(|x| x["text"].as_str()).collect::<Vec<_>>().join("\n"),
        _ => String::new(),
    }
}

/// An Anthropic messages request as an OpenAI chat-completions request.
pub fn anthropic_to_openai(req: &Value) -> Value {
    let mut messages = Vec::new();
    let system = blocks_text(&req["system"]);
    if !system.is_empty() {
        messages.push(json!({ "role": "system", "content": system }));
    }
    for m in req["messages"].as_array().into_iter().flatten() {
        let blocks = m["content"].as_array().cloned().unwrap_or_default();
        for r in blocks.iter().filter(|b| b["type"] == "tool_result") {
            messages.push(json!({ "role": "tool", "tool_call_id": r["tool_use_id"], "content": blocks_text(&r["content"]) }));
        }
        let calls: Vec<Value> = blocks
            .iter()
            .filter(|b| b["type"] == "tool_use")
            .map(|b| json!({ "id": b["id"], "type": "function", "function": { "name": b["name"], "arguments": b["input"].to_string() } }))
            .collect();
        let text = blocks_text(&m["content"]);
        if text.is_empty() && calls.is_empty() {
            continue;
        }
        let mut msg = json!({ "role": m["role"], "content": text });
        if !calls.is_empty() {
            msg["tool_calls"] = json!(calls);
        }
        messages.push(msg);
    }
    let mut out = json!({ "model": req["model"].as_str().unwrap_or("auto"), "messages": messages });
    for k in ["max_tokens", "temperature"] {
        if !req[k].is_null() {
            out[k] = req[k].clone();
        }
    }
    let tools: Vec<Value> = req["tools"].as_array().into_iter().flatten().map(|t| json!({ "type": "function", "function": { "name": t["name"], "description": t["description"], "parameters": t["input_schema"] } })).collect();
    if !tools.is_empty() {
        out["tools"] = json!(tools);
    }
    out
}

/// A chat.completion answer as an Anthropic message.
pub fn openai_to_anthropic(ans: &Value) -> Value {
    let msg = &ans["choices"][0]["message"];
    let mut content = Vec::new();
    if let Some(t) = msg["content"].as_str().filter(|t| !t.is_empty()) {
        content.push(json!({ "type": "text", "text": t }));
    }
    for c in msg["tool_calls"].as_array().into_iter().flatten() {
        let input: Value = serde_json::from_str(c["function"]["arguments"].as_str().unwrap_or("{}")).unwrap_or(json!({}));
        content.push(json!({ "type": "tool_use", "id": c["id"], "name": c["function"]["name"], "input": input }));
    }
    let stop = match ans["choices"][0]["finish_reason"].as_str() {
        Some("length") => "max_tokens",
        Some("tool_calls") => "tool_use",
        _ => "end_turn",
    };
    json!({
        "id": ans["id"], "type": "message", "role": "assistant", "model": ans["model"], "content": content, "stop_reason": stop,
        "usage": { "input_tokens": ans["usage"]["prompt_tokens"], "output_tokens": ans["usage"]["completion_tokens"] },
        "router": ans["router"]
    })
}
