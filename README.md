# open

One Rust workspace and one framework: agents browse, crawl, tunnel, route and render from the same crates. No vendored
upstream, no `third_party/`: every dependency is a crates.io version or a git revision pinned in the root
`Cargo.toml` ([docs/upstream.md](docs/upstream.md)).

## Layout

| Path | What |
| :-- | :-- |
| `crates/open` | the framework crate (re-exports every surface behind a feature) and the `open` command |
| `crates/browse` | agent browser: direct CDP sessions and the relay of the Chrome extension, on the `browse-*` crates of [anomalyco/browse](https://github.com/anomalyco/browse) |
| `crates/crawl` | crawler: robots.txt, SSRF guard, shields, queue, browser rendering, FTS5 shards, site mirror, `fetch` (curl) |
| `crates/browser-engines` | engine registry, headless launcher, async CDP client, SSRF guard; drives a browser, never embeds one |
| `crates/tunnel` | blind TLS tunnels on the `opentunnel` client |
| `crates/tui` | terminal UI on [OpenTUI](https://github.com/anomalyco/opentui) |
| `crates/ai-router` | multi-provider AI router, OpenAI-compatible service, CLI and C ABI |
| `crates/c-abi`, `crates/adblock-capi`, `crates/hub` | C ABI primitives, adblock engine glue, Hugging Face Hub compatible service |
| `extension/` | the MV3 Chrome extension of browse, built with Bun |
| `packages/` | Bun bindings Aphrody consumes: `@aphrody/ai-router` (C ABI), `@aphrody/browser-engines`, `@aphrody/crawl` |
| `apps/` | first-party apps (Material 3 web, router agent, Android shell) |

GPU UI is [Rune](https://github.com/anomalyco/rune) behind the `ui` feature of `crates/open`.

## Build

```sh
cargo check --workspace                 # builds on a build host, not on a workstation
bun scripts/opentui-native.ts           # OpenTUI's native library, once per platform
cargo build --release -p open           # fat LTO, one codegen unit (profile.release)
cargo build --release -p open --features tui,ui
```

`open --help` lists the commands: `crawl`, `fetch`, `mirror`, `search`, `browse` (`mcp`, `relay`, `demo`, `tools`),
`tunnel up`, `engines`, `tui`.

## Scripts

The root `package.json`:

```sh
bun run test-ts          # bun test in each workspace package (never at the root)
bun run private          # no private data of this machine in tracked files
bun run opentui-native   # OpenTUI native library for this platform
bun run upstream         # pins table of docs/upstream.md
```

## Crawl ecosystem to Rust

| JS or Python | Here |
| :-- | :-- |
| Crawlee, Apify SDK | `crawl::Crawler` (queue, robots, politeness, render), `crawl::Shard` (dataset, searchable) |
| Playwright, Puppeteer | `open_browser_engines::cdp` + `browse` page tools |
| curl, wget | `crawl::fetch`, `crawl::mirror` |
| Apify client | `reqwest` |
