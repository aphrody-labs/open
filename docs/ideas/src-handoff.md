# Handoff from src (session src-2d)

What `aphrody-labs/aphrody` holds inside `open`'s scope (UI, TUI, GUI, desktop and mobile Material 3, crawl, browser engines, AI routing and inference). Session src-2d no longer extends any of it in src; each row says where to pick it up. References are src commits.

## Web UI and Material 3

| Item | State in src | Commit | Pick up in open |
|---|---|---|---|
| Material Web (`@material/web`) | removed: in maintenance (README looks for maintainers, not archived); its only consumers were two dead components of `apps/auto` | 406ccf22, 64e76a49 | do not reintroduce (D3) |
| Angular + Angular Material | root catalog at `22.3.0-rc.0` (npm `next` tag read live); `apps/aphrody/web` builds on the test host | 1c4cd2d8, 7b86d5fc | base of the D3 Angular fork |
| Angular M3 theme | `packages/design`: Sass `mat.theme` + `--mat-sys-*` generated from MCU tokens (`assets/brand/brand.toml`); Google's official tokens read live | 64e76a49, 63c1430b | D14 source |
| M3 colour in C | `ui/hct.c` (CAM16, HctSolver, dynamic schemes), `m3.c` | b79d6f6b | candidate for the D3 shared C ABI |
| modern-web-guidance review | gnu.aphrody.com: http(s)-only links, ARIA tabs, deferred search (INP); M3 telemetry via `textContent` | a4840899, 8aae9606 | apply the same rules to open's surfaces |

## Desktop

| Item | State | Commit | Pick up |
|---|---|---|---|
| Electron migrator | `ay electron` (analyze, migrate, optimize, bench), Tauri v3 and GPUI generators, Bun sidecar, skill `electron-migrate`, relay MCP server | 3f977662, 0150f70a, 275ff359, 7847d118, 1b3ea84f | roadmap note e32d1e957; frozen in src |
| Gemini desktop tests | Gemini app inventory, e2e suite (agent-desktop, rea, ghidra, agent-browser), `just e2e-desktop` | a9ee94ac | reusable for open's desktop proofs |

## Mobile

| Item | State | Commit | Pick up |
|---|---|---|---|
| Android toolchain | `infra/android/android.toml` (Studio, JDK, NDK, SDK, Kotlin resolved) | 758de936 | base for Compose Multiplatform (D4) |
| `apps/android-shell` | Compose Material 3 app proven on the API 37 emulator (layout + screenshot) | 758de936 | moved into open (3a4463101) |

## Browser engines and crawl

| Item | State | Commit | Pick up |
|---|---|---|---|
| Chromium third_party | organised like upstream, trackers (channels, CEF, Skia, Blink, cef-rs, deno_core, V8 of node/electron/obscura, agent-browser, Lightpanda zig-v8) | `third_party/chrome-channels.toml`, skill `chromium` | browser-and-crawl.md |
| Lightpanda | `ay up` installs the release, `packages/browser/native` synced with lightpanda-io/browser main | 49db7cf8, 9e9e6de2, 0ac9ff5b | moved into open (3a4463101); Windows plan in the roadmap |
| `ay engines` backends | switch between bun (JSC) and chromium per channel | 4d754ef5 | engines (D6) |
| Site mirror | `tools/site-mirror` | 85906b13 | moved into open (3a4463101); reference archive (D6) |

## AI routing and gateways

| Item | State | Commit | Pick up |
|---|---|---|---|
| Router, `ay-chat`, `ay-chat-gui` | removed from src by session apps-4d | 2c058770 | ai-router.md |
| Gemini web MCP gateway | `mcp.aphrody.com` Worker with OAuth, relay origin on the test host; the full OAuth flow waits for a Google consent | session src-2d | attach to routing (D2, D10) |

## Rules learned (src-2d)

- No hardcoded version, date or list: resolve live (release APIs, npm dist-tags, maven-metadata, gitiles); src's `just hygiene` checks it.
- "Done" = latest upstream, built, tested, running, shipped as skill + MCP, hygiene green.
- Read the real imports before claiming a dependency: `rg` over imports and manifests, then the graph, never a package name alone.
