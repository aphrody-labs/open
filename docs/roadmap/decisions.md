# Decisions

## Generalist rule (D21, owner)

Aphrody is generalist: no framework, programming language, OS, architecture or human language is hand-picked. Every selection is a rule applied to the generated registries, re-evaluated when they change:

| Dimension | Registry | Rule |
|---|---|---|
| UI frameworks | [inventory/frameworks.json](../ideas/inventory/frameworks.json) (registries + GitHub) | every framework with an official or community Material implementation is a target; the official Google implementations are the reference |
| Programming languages | [inventory/targets.json](../ideas/inventory/targets.json) `languages` (Linguist) | every language with a C FFI consumes the shared C ABI |
| OS and architectures | `targets.json` `rust`, `go`, `zig`, `bun` | every target the toolchains of a component support |
| Human languages | `targets.json` `locales` (CLDR) | every CLDR locale, English as source |

The names in the decisions below are the first instances of these rules (where work starts), not limits.

## Taken by the owner

| Id | Question | Decision |
|---|---|---|
| D2 | Shape of the router | **Embedded library and service**: one core, one C ABI, a service on top |
| D3 | Web UI | **Angular** on a fork that follows upstream automatically, with aggressive Bun patches, AOT and LTO compilation, and a C ABI shared with the other frameworks (Rust, TypeScript, Zig, .NET, C++, ...) |
| D4 | Desktop, mobile, web | **Maximum coverage**: Flutter (desktop, mobile, web), Rust at the same level, Jetpack Compose Multiplatform as well |
| D8 | Inference | **Local first**; every inference type and every cloud provider |
| D12 | Build system | **Bazel everywhere** in Aphrody (thought of as a future Google project); just, Turborepo, Bun, Cargo and LLVM are called by Bazel targets |
| D13 | Gate levels | **Modelled on Bun's commands**: `check`, `fmt`, `lint`, `build`, `compile`, `test`, `webview`, `pm`; reuse `ay` and the Bun Rust crates already in Aphrody |
| D14 | Material spec sources | **Multi-source extraction**: Figma Material 3 kit; GitHub repositories of Google, Chrome and Chromium (UI views), Jetpack Compose, Angular components, Flutter; the full sites from A to Z; Google's design skills and MCP servers; community versions (MUI, ...) |
| D18 | Ecosystem inventory | **Very wide**: Material for GTK 4, Qt, COSMIC, Hyprland, egui, iced, Dioxus, gpui; taffy; shadcn, Tailwind, Base UI; React, Svelte, JS, TS; .NET; etc. |
| D19 | M3 components in the Bun app | **Angular Material**, following D3 (Material Web removed from src as legacy) |
| D20 | Language | **English at the source**, multilingual through i18n and a translation stack, for every project |
| D21 | Selections | **Generalist**: rules over generated registries, see the top of this file |
| D22 | `open` and `auto` | **One codebase, two editions**: `open` is the open-source core, `auto` the paid hosted edition that consumes it ([vision.md](vision.md)) |

## Still open

| Id | Question | Options | Recommendation |
|---|---|---|---|
| D1 | What stays in `open`? | everything (93 sources + ecosystem); only what the products use | keep the full lock, build only what the products use |
| D5 | Terminal | opentui + M3 palette; other | opentui |
| D6 | Reference archive | tools of [browser-and-crawl](../ideas/browser-and-crawl.md); storage | Crawlee + Chrome for Testing + browsertrix (WACZ); storage to define |
| D7 | Rust native UI framework | catalog; common base; choose one | with D4 (Rust at Flutter's level), pick the one that carries M3 best after comparison |
| D9 | Scope of "every inference type" | text, vision, audio (STT/TTS), image, video, embeddings, rerank, realtime | priority order to set |
| D10 | Cloud providers | every discovered provider (models.dev, OpenRouter, Hugging Face, Cloudflare and Vercel gateways) | catalog discovered at run time, no hardcoded list |
| D11 | Local engines | llama.cpp, Ollama, ONNX Runtime, OpenVINO, MLX, WebGPU (browser) | per target hardware |
| D15 | Results store | SQLite as source, Redis as cache and queue, JSON and MDX as exports | as stated |
| D16 | Target frameworks of the full-stack generation | Angular, Next.js, Flutter web, Leptos, Dioxus, ... | to set |
| D17 | Where the benchmark runs | PC only, VPS, or both with distribution | both |
