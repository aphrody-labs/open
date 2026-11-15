# Long-term vision

`open` gathers the open-source ecosystem Aphrody needs into a single repository built end to end, and derives three products from it:

1. **A free AI router**: multi-provider, local first, then free offers, then the cheapest paid ones; compatible with OpenAI and Anthropic; exposed as an embeddable library through a C ABI and as a self-hostable service.
2. **Authentic Material 3 interfaces**: Google's official implementations (Angular Material, Compose, Flutter) plus Rust at the same level, themed with the Aphrody identity, on web, desktop, mobile and terminal.
3. **A living source of truth**: reference sites and repositories (design.google, m3.material.io, M3 implementations, the "open" ecosystem) archived, indexed and linked to the code.

Editions (owner): `open` is the open-source edition and `auto` (`apps/auto` in aphrody-labs/aphrody) is its paid hosted edition. One vision, one codebase, one feature set, in the relation Crawlee has to Apify, n8n to n8n Cloud, Chromium to Chrome:

- `open` holds the core: workflow automation, agents, ingestion, crawl and browser engines, store, client, domain model, UI, native bindings, i18n.
- `auto` consumes that core and keeps only the hosted layer: tenancy, billing, hosted workers, administration, store listings.
- auto's core packages (`automate`, `agent`, `ingest`, `store`, `client`, `domain`, `ui`, `native`, `i18n`) move into `open` with their history once their English and i18n pass in src has landed (decision D22).

Principles:

- Absorb rather than rewrite; provenance (lock) for everything that enters.
- No hardcoded values: data read from a source, versions resolved at run time.
- Deliver complete: every step ends built, running, tested and proven.
- English at the source, multilingual through i18n.
- Bazel everywhere; Bun for JS/TS (AOT), Rust with fat LTO, C for the ABI, Zig where upstream uses it.
