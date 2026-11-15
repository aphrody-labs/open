# Handoff from src (session src-8a4291)

Work done in the Aphrody monorepo (`aphrody-labs/aphrody`) in the areas `open` now owns: UI and Material 3, browser engines, AI routing. Each item gives the state, the files and commits in src, and what is left. src only repairs breakages in these areas from now on.

## Web UI and Material 3

- State: `packages/design` and `apps/aphrody/web` moved from Material Web (`@material/web`, in maintenance mode, not archived) to Angular Material. Tokens still come from Material Color Utilities; `build.ts` emits `tokens/angular-theme.scss` (`mat.theme`) and `tokens/angular-material.css` mapping `--mat-sys-*` onto `--md-sys-*`.
- Build: `apps/aphrody/web` is an Angular standalone zoneless app built with `bunx --bun ng build`. Bun.build cannot run the Angular AOT linker on Angular Material's partial-Ivy code, which is why the Angular builder is used. Output goes to `public/m3`.
- Proof: `bun test packages/design` 31/31 (re-run by src-8a4291). The Chrome render (4 cards, 7 buttons, empty console, wasm host boots, theme toggle) was reported by the migration agent and not re-run. The root catalog now pins `@angular/core` and `@angular/material` at `22.3.0-rc.0`.
- `packages/deploy` Worker pages lost their `md-*` buttons (native `.btn` on the same tokens).
- Commits: `64e76a49e0`, `7b86d5fc57`, `6a9d4f4153`.
- Left for open: align with decision D3 (Angular on an auto-following fork with Bun patches, AOT/LTO, shared C ABI) (the src build uses stock `@angular/*` from npm); `md-*` strings remain in `src/ui/m3.c`, `src/ui/site_wasi.c`, `apps/auto` and `packages/design/src/adapters.ts`.
- Warning: the migration agent ran a bare `bun fmt` over the shared src tree; about 107 files with other sessions' uncommitted edits may carry formatting-only noise.

## Brand pipeline (repair in progress in src)

- `src/ui/kit/src/brand/mod.rs` (`ay brand build`, bin `aphrody-brand`) is broken since src commit `0c8ed2d7`: `brand.toml` `font_file` points at the Material Symbols icon font while text is shaped with it (`font = "Google Sans Flex"`); `build()` deletes all of `assets/brand/gen/`, which now holds committed inputs (`gen/symbols`, `gen/zukan`, `gen/themes` from `packages/assets`); it reads `assets/brand/symbols/<name>.svg`, which no longer exists. `assets/brand/{fetch,check,publish}.ts` were deleted with no replacement.
- A src agent is repairing it as a breakage (live-resolved font and symbol sources with a lock, inputs dir never deleted, check step in Rust, double build compared on the build host). Further brand or design work belongs to open.

## Browser engines

- Registry: `packages/browser-engines/src/engines/registry.ts`, one row per engine (Chrome for Testing channels, Playwright, system Chrome, repo Chromium built on a build host, Obscura, Servo, Blitz, JavaScriptCore, V8, Dawn, wgpu, automation tools).
- Backend selection: `packages/browser-engines/src/engines/backend.ts`, `ay engines backend list|pick|use [id] [--need cdp,webgpu] [--js ..] [--channel ..] [--write]`. No list of its own: candidates, channels and automation deps come from the registry; order is argument, `AY_BACKEND`, `.engine-version`, needs, project detection, then the running Bun (JavaScriptCore). Commits `4d754ef5f9`, `a6f4aacca9`, `0e5d9c97bd`.
- Lightpanda: absorbed in `packages/browser/native` (fork `aphrody-labs/browser`, upstream `lightpanda-io/browser`, `build.zig.zon` 1.1.0-dev, Zig 0.17.0 minimum) with a C ABI (`src/capi_main.zig`, `lp_*`) and the Bun binding `packages/browser/src/index.ts`. Registered as engine `lightpanda` (CDP, `serve --host 127.0.0.1 --port N`) in `05a0c29704`; release binary install added in `49db7cf8` (tools.toml). Not done: building the fork on a build host, `browser_capi` shared library, a CDP navigation proof, `bun test packages/browser` against a built library.

## AI routing

- Router: `packages/ai-os/src/router` (catalog, engine, policy, stats, wire, http, tools, config). Endpoints `/v1/chat/completions`, `/v1/models`, `/v1/messages`; modes `auto:*` and `arena` with Elo (`ELO_K = 32`).
- Catalog joins live sources: models.dev `api.json`, the LiteLLM price map, OpenRouter `/api/v1/models`, the Hugging Face router `/v1/models`, LMArena datasets. URLs, TTLs and failover timings are in `router/config.ts` (env-overridable).
- `auto:code` ranks by the Arena coding category (`Offer.arenaCode`) with fallback to the overall rating; both Arena fetches (overall and coding) go through the datasets-server `/filter` endpoint. Measured on 2026-11-15: `/filter` and `/rows` for `lmarena-ai/leaderboard-dataset` answer HTTP 501 "Job has been terminated due to a temporary spike in resource usage", so the Arena columns of the catalog are empty until the datasets-server recovers or the router reads the dataset's Parquet files directly. Commit `3c92797abb`.
- `wire.ts` translates OpenAI and Anthropic messages by hand (188 lines): no AI SDK or LiteLLM adapter is installed in src.
- Relay e2e: `bun test packages/ai-os/test/relay/e2e.test.ts`, 66/66 on 2026-11-15.

## Shared facts

- Context7: the vault entry is `CTX7_API_KEY` (not `CONTEXT7_API_KEY`); the relay hub sends it through `[[hub.mcp]] headers` mapping header names to env vars (`3b7c8bd554`, `85b39e1046`), `research/context7.ts` reads it too (`3eaaf3b741`).
- Monorepo map of src: `bun scripts/topology.ts --viewer <topology-viewer.html>` writes `docs/topology/` (interactive `TOPOLOGY.html`, mermaid); built on `bun scripts/checkdeps.ts --units` (`05a0c29704`).
- Hygiene engine: `bun scripts/hygiene.ts` in src (pinned versions, dated names, absolute paths, hand-kept lists, scrapers, slop, dead refs).
