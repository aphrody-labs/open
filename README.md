# open

<!-- catalog:begin unit -->
| Type | Path |
| :-- | :-- |
| App | `apps/open` |

**Commands**

```sh
bun run --cwd apps/open test-ts
bun run --cwd apps/open private
bun run --cwd apps/open opentui-native
bun run --cwd apps/open upstream
```

Part of Aphrody: [aphrody-labs/aphrody](../../README.md), [Catalog](../../docs/reference/catalog/app.md).
<!-- catalog:end -->

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

## Crawl ecosystem to Rust

| JS or Python | Here |
| :-- | :-- |
| Crawlee, Apify SDK | `crawl::Crawler` (queue, robots, politeness, render), `crawl::Shard` (dataset, searchable) |
| Playwright, Puppeteer | `browser_engines::cdp` + `browse` page tools |
| curl, wget | `crawl::fetch`, `crawl::mirror` |
| Apify client | `reqwest` |
