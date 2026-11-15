//! ai-router-tui: full-screen terminal chat over the router.
//! Enter sends, Tab cycles the policy (auto, auto:local, auto:free, auto:cheap), PageUp/PageDown scroll, Esc quits.
//! Configuration is the router's (AI_ROUTER_CATALOG, AI_ROUTER_LOCAL, provider credentials in the environment).

use ai_router::{Config, Router};
use ratatui::crossterm::event::{self, Event, KeyCode, KeyEventKind, KeyModifiers};
use ratatui::layout::{Constraint, Layout};
use ratatui::style::{Modifier, Style};
use ratatui::text::{Line, Span};
use ratatui::widgets::{Block, Borders, Paragraph, Wrap};
use serde_json::{json, Value};
use std::sync::mpsc;
use std::sync::Arc;
use std::time::Duration;

const POLICIES: [&str; 4] = ["auto", "auto:local", "auto:free", "auto:cheap"];

enum Update {
    Token(String),
    Done(Value),
}

struct Turn {
    role: &'static str,
    text: String,
}

fn main() {
    let config = Config {
        local: std::env::var("AI_ROUTER_LOCAL").ok().map(|v| v.split(',').map(str::trim).filter(|s| !s.is_empty()).map(str::to_owned).collect()),
        ..Config::default()
    };
    let router = match Router::open(&config) {
        Ok(r) => Arc::new(r),
        Err(e) => {
            eprintln!("{e}");
            std::process::exit(1);
        }
    };
    let mut terminal = ratatui::init();
    let mut turns: Vec<Turn> = Vec::new();
    let mut input = String::new();
    let mut policy = 0usize;
    let mut status = format!("{} usable offers", router.models("auto").len());
    let mut scroll: u16 = 0;
    let mut pending: Option<mpsc::Receiver<Update>> = None;

    loop {
        if let Some(rx) = &pending {
            while let Ok(u) = rx.try_recv() {
                match u {
                    Update::Token(t) => {
                        if let Some(last) = turns.last_mut() {
                            last.text.push_str(&t);
                        }
                    }
                    Update::Done(summary) => {
                        status = match summary.get("error") {
                            Some(e) => format!("failed: {}", e["message"].as_str().unwrap_or("")),
                            None => format!("{} ({} attempt(s))", summary["router"]["offer"].as_str().unwrap_or(""), summary["router"]["attempts"].as_array().map_or(0, Vec::len)),
                        };
                        pending = None;
                        break;
                    }
                }
            }
        }
        let busy = pending.is_some();
        let _ = terminal.draw(|f| {
            let [chat_area, input_area, status_area] = Layout::vertical([Constraint::Min(3), Constraint::Length(3), Constraint::Length(1)]).areas(f.area());
            let lines: Vec<Line> = turns
                .iter()
                .flat_map(|t| {
                    let head = Line::from(Span::styled(if t.role == "user" { "You" } else { "Assistant" }, Style::default().add_modifier(Modifier::BOLD)));
                    std::iter::once(head).chain(t.text.lines().map(|l| Line::from(l.to_owned()))).chain(std::iter::once(Line::from("")))
                })
                .collect();
            let total = lines.len() as u16;
            let visible = chat_area.height.saturating_sub(2);
            let top = total.saturating_sub(visible).saturating_sub(scroll);
            f.render_widget(Paragraph::new(lines).wrap(Wrap { trim: false }).scroll((top, 0)).block(Block::default().borders(Borders::ALL).title(" ai-router ")), chat_area);
            let title = format!(" {} {} ", POLICIES[policy], if busy { "(answering)" } else { "(Enter to send, Tab policy, Esc quit)" });
            f.render_widget(Paragraph::new(input.as_str()).block(Block::default().borders(Borders::ALL).title(title)), input_area);
            f.render_widget(Paragraph::new(status.as_str()).style(Style::default().add_modifier(Modifier::DIM)), status_area);
        });
        if !event::poll(Duration::from_millis(50)).unwrap_or(false) {
            continue;
        }
        let Ok(Event::Key(k)) = event::read() else { continue };
        if k.kind != KeyEventKind::Press {
            continue;
        }
        match k.code {
            KeyCode::Esc => break,
            KeyCode::Char('c') if k.modifiers.contains(KeyModifiers::CONTROL) => break,
            KeyCode::Tab => policy = (policy + 1) % POLICIES.len(),
            KeyCode::PageUp => scroll = scroll.saturating_add(5),
            KeyCode::PageDown => scroll = scroll.saturating_sub(5),
            KeyCode::Backspace => {
                input.pop();
            }
            KeyCode::Enter if !busy && !input.trim().is_empty() => {
                turns.push(Turn { role: "user", text: std::mem::take(&mut input) });
                let messages: Vec<Value> = turns.iter().map(|t| json!({ "role": t.role, "content": t.text })).collect();
                turns.push(Turn { role: "assistant", text: String::new() });
                scroll = 0;
                let (tx, rx) = mpsc::channel();
                let router = router.clone();
                let request = json!({ "model": POLICIES[policy], "messages": messages });
                std::thread::spawn(move || {
                    let summary = router.chat_stream(&request, &mut |c| {
                        if let Some(t) = c["choices"][0]["delta"]["content"].as_str() {
                            let _ = tx.send(Update::Token(t.to_owned()));
                        }
                    });
                    let _ = tx.send(Update::Done(summary));
                });
                pending = Some(rx);
                status = "answering".to_owned();
            }
            KeyCode::Char(c) => input.push(c),
            _ => {}
        }
    }
    ratatui::restore();
}
