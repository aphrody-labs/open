//! OpenAI-compatible HTTP service over a router: `POST /v1/chat/completions`, `GET /v1/models`, `GET /health`.
//! Any OpenAI client or SDK points its base URL at it. One thread per request.

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
                _ => reply(req, 404, &json!({ "error": { "message": "not found", "type": "not_found" } })),
            }
        });
    }
    Ok(())
}
