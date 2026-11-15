//! End to end against local stand-ins of three providers (OpenAI-compatible, Anthropic, Google) on loopback ports.

use ai_router::{capi, Config, Router};
use serde_json::{json, Value};
use std::ffi::{CStr, CString};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

/// A loopback server answering every POST with `status` and `body`; returns its base URL and a request counter.
fn stand_in(status: u16, body: Value) -> (String, Arc<AtomicUsize>) {
    let server = tiny_http::Server::http("127.0.0.1:0").unwrap();
    let base = format!("http://{}", server.server_addr());
    let hits = Arc::new(AtomicUsize::new(0));
    let h = hits.clone();
    std::thread::spawn(move || {
        for mut req in server.incoming_requests() {
            let mut s = String::new();
            let _ = req.as_reader().read_to_string(&mut s);
            h.fetch_add(1, Ordering::SeqCst);
            let _ = req.respond(tiny_http::Response::from_string(body.to_string()).with_status_code(status));
        }
    });
    (base, hits)
}

fn completion(text: &str) -> Value {
    json!({ "id": "x", "object": "chat.completion", "choices": [{ "index": 0, "message": { "role": "assistant", "content": text }, "finish_reason": "stop" }] })
}

fn catalog(entries: &[(&str, &str, &str, &str, f64)]) -> Value {
    let mut doc = serde_json::Map::new();
    for (pid, npm, api, env, cost) in entries {
        doc.insert(
            (*pid).to_owned(),
            json!({ "id": pid, "npm": npm, "api": api, "env": [env], "models": { "m": { "name": "m", "cost": { "input": cost, "output": cost }, "limit": { "context": 100000 }, "tool_call": true, "modalities": { "input": ["text"], "output": ["text"] } } } }),
        );
    }
    Value::Object(doc)
}

fn set(k: &str) {
    // SAFETY: tests set credential variables before any thread of the router reads them
    unsafe { std::env::set_var(k, "test-credential") };
}

#[test]
fn zero_cost_first_then_failover_to_the_next_offer() {
    let (busy, busy_hits) = stand_in(429, json!({ "error": "rate limited" }));
    let (ok, ok_hits) = stand_in(200, completion("hello"));
    set("AIR_T1_A");
    set("AIR_T1_B");
    let config = Config { catalog: Some(catalog(&[("free-a", "@ai-sdk/openai-compatible", &busy, "AIR_T1_A", 0.0), ("paid-b", "@ai-sdk/openai-compatible", &ok, "AIR_T1_B", 1.5)])), local: Some(vec![]), ..Config::default() };
    let r = Router::open(&config).unwrap();
    let order: Vec<String> = r.models("auto").iter().map(|o| o.id()).collect();
    assert_eq!(order, ["free-a/m", "paid-b/m"]);
    let answer = r.chat(&json!({ "model": "auto", "messages": [{ "role": "user", "content": "hi" }] }));
    assert_eq!(answer["choices"][0]["message"]["content"], "hello");
    assert_eq!(answer["router"]["offer"], "paid-b/m");
    assert_eq!(answer["router"]["attempts"][0]["status"], 429);
    assert_eq!((busy_hits.load(Ordering::SeqCst), ok_hits.load(Ordering::SeqCst)), (1, 1));
}

#[test]
fn offers_without_credentials_are_never_tried() {
    let (ok, hits) = stand_in(200, completion("unused"));
    let config = Config { catalog: Some(catalog(&[("nokey", "@ai-sdk/openai-compatible", &ok, "AIR_T2_UNSET", 0.0)])), local: Some(vec![]), ..Config::default() };
    let r = Router::open(&config).unwrap();
    assert!(r.models("auto").is_empty());
    let answer = r.chat(&json!({ "messages": [{ "role": "user", "content": "hi" }] }));
    assert_eq!(answer["error"]["type"], "router_exhausted");
    assert_eq!(hits.load(Ordering::SeqCst), 0);
}

#[test]
fn anthropic_and_google_answers_come_back_as_chat_completions() {
    let (anth, _) = stand_in(200, json!({ "id": "msg", "content": [{ "type": "text", "text": "from anthropic" }], "stop_reason": "end_turn", "usage": { "input_tokens": 3, "output_tokens": 2 } }));
    let (goog, _) = stand_in(200, json!({ "candidates": [{ "content": { "parts": [{ "text": "from google" }] }, "finishReason": "STOP" }], "usageMetadata": { "promptTokenCount": 3, "candidatesTokenCount": 2 } }));
    set("AIR_T3_A");
    set("AIR_T3_G");
    let config = Config { catalog: Some(catalog(&[("anth", "@ai-sdk/anthropic", &anth, "AIR_T3_A", 1.0), ("goog", "@ai-sdk/google", &goog, "AIR_T3_G", 2.0)])), local: Some(vec![]), ..Config::default() };
    let r = Router::open(&config).unwrap();
    let a = r.chat(&json!({ "model": "anth/m", "messages": [{ "role": "system", "content": "be brief" }, { "role": "user", "content": "hi" }] }));
    assert_eq!(a["choices"][0]["message"]["content"], "from anthropic");
    assert_eq!(a["usage"]["completion_tokens"], 2);
    let g = r.chat(&json!({ "model": "goog/m", "messages": [{ "role": "user", "content": "hi" }] }));
    assert_eq!(g["choices"][0]["message"]["content"], "from google");
}

#[test]
fn local_servers_come_first_and_through_the_c_abi() {
    let (local, _) = stand_in(200, completion("local answer"));
    // a local OpenAI-compatible server lists its models at /models
    let models_server = tiny_http::Server::http("127.0.0.1:0").unwrap();
    let base = format!("http://{}", models_server.server_addr());
    let target = local.clone();
    std::thread::spawn(move || {
        for req in models_server.incoming_requests() {
            if req.url().ends_with("/models") {
                let _ = req.respond(tiny_http::Response::from_string(json!({ "data": [{ "id": "tiny" }] }).to_string()));
            } else {
                // forward chat requests to the completion stand-in
                let mut res = ureq::post(format!("{target}/chat/completions")).send_json(json!({})).unwrap();
                let _ = req.respond(tiny_http::Response::from_string(res.body_mut().read_to_string().unwrap()));
            }
        }
    });
    set("AIR_T4_P");
    let (paid, paid_hits) = stand_in(200, completion("paid answer"));
    let config = json!({ "catalog": catalog(&[("paid", "@ai-sdk/openai-compatible", &paid, "AIR_T4_P", 3.0)]), "local": [base] });
    let c = CString::new(config.to_string()).unwrap();
    let router = unsafe { capi::aphrody_router_open(c.as_ptr()) };
    assert!(!router.is_null());
    let req = CString::new(json!({ "messages": [{ "role": "user", "content": "hi" }] }).to_string()).unwrap();
    let out = unsafe { capi::aphrody_router_chat(router, req.as_ptr()) };
    let answer: Value = serde_json::from_str(unsafe { CStr::from_ptr(out) }.to_str().unwrap()).unwrap();
    unsafe { capi::aphrody_free(out) };
    assert_eq!(answer["choices"][0]["message"]["content"], "local answer");
    assert_eq!(answer["router"]["local"], true);
    assert_eq!(paid_hits.load(Ordering::SeqCst), 0);
    let m = CString::new("auto:cheap").unwrap();
    let list = unsafe { capi::aphrody_router_models(router, m.as_ptr()) };
    let offers: Value = serde_json::from_str(unsafe { CStr::from_ptr(list) }.to_str().unwrap()).unwrap();
    unsafe { capi::aphrody_free(list) };
    assert_eq!(offers.as_array().unwrap().len(), 1);
    unsafe { capi::aphrody_router_close(router) };
}

#[test]
fn the_service_answers_openai_and_anthropic_clients() {
    let (ok, _) = stand_in(200, json!({ "object": "chat.completion", "choices": [{ "index": 0, "message": { "role": "assistant", "content": "served" }, "finish_reason": "stop" }], "usage": { "prompt_tokens": 4, "completion_tokens": 1 } }));
    set("AIR_T5_K");
    let config = Config { catalog: Some(catalog(&[("svc", "@ai-sdk/openai-compatible", &ok, "AIR_T5_K", 0.0)])), local: Some(vec![]), ..Config::default() };
    let router = Router::open(&config).unwrap();
    let (tx, rx) = std::sync::mpsc::channel();
    std::thread::spawn(move || ai_router::server::serve(router, "127.0.0.1:0", |a| tx.send(a).unwrap()).unwrap());
    let base = format!("http://{}", rx.recv().unwrap());
    let models: Value = ureq::get(format!("{base}/v1/models")).call().unwrap().body_mut().read_json().unwrap();
    assert_eq!(models["data"][0]["id"], "svc/m");
    let openai: Value = ureq::post(format!("{base}/v1/chat/completions")).send_json(json!({ "messages": [{ "role": "user", "content": "hi" }] })).unwrap().body_mut().read_json().unwrap();
    assert_eq!(openai["choices"][0]["message"]["content"], "served");
    let anthropic: Value = ureq::post(format!("{base}/v1/messages"))
        .send_json(json!({ "model": "auto", "max_tokens": 64, "system": "brief", "messages": [{ "role": "user", "content": [{ "type": "text", "text": "hi" }] }] }))
        .unwrap()
        .body_mut()
        .read_json()
        .unwrap();
    assert_eq!(anthropic["type"], "message");
    assert_eq!(anthropic["content"][0]["text"], "served");
    assert_eq!(anthropic["stop_reason"], "end_turn");
    assert_eq!(anthropic["usage"]["output_tokens"], 1);
}
