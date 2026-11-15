# ai-router

Multi-provider AI router: a library with a C ABI, a CLI and an HTTP service compatible with OpenAI and Anthropic clients.

- **Offers discovered at run time**: the [models.dev](https://models.dev) catalog (providers, base URLs, prices, limits, modalities, the variables that hold credentials) and the OpenAI-compatible servers running on this machine (Ollama, llama.cpp server, LM Studio, or `AI_ROUTER_LOCAL`). No model list is written in the code.
- **Order**: local servers first, then offers at zero cost for the caller, then the cheapest. An offer whose credential variable is not set is never tried. Policies: `auto`, `auto:local`, `auto:free`, `auto:cheap`, or an offer id `<provider>/<model>` followed by the `auto` order.
- **Failover**: on any failure (rate limit, quota, server error, timeout, refused model) the next offer is tried; the answer carries `router.offer` and `router.attempts`.
- **Protocols spoken upstream**: OpenAI-compatible, Anthropic messages, Google generateContent.
- **Free and unlimited**: zero-cost offers and local models come first; local models have no quota, remote free offers do.

## Surfaces

| Surface | How |
|---|---|
| CLI | `ai-router models [policy] [--json]`, `ai-router chat [--model <policy or id>] <prompt>` |
| Service | `ai-router serve [--addr host:port]`: `POST /v1/chat/completions`, `POST /v1/messages`, `GET /v1/models`, `GET /health` |
| C ABI | `include/ai_router.h`: `aphrody_router_open`, `_chat`, `_models`, `_close`, `_last_error`; strings freed with `aphrody_free` (crate `c-abi`) |
| Bun | `packages/ai-router` (bun:ffi), with streaming |
| Terminal | `crates/ai-router-tui`: full-screen chat, streamed answers, policy switch |
| GUI, desktop, mobile web | `apps/ai-router`: Angular Material chat, one Bun process (`--open` starts it in the system browser), installable web manifest |
| Container (serverless, cloud, self-hosted) | `deploy/Containerfile`: static binary in an empty image, published as `ghcr.io/aphrody-labs/ai-router` by the workflow after a health check |
| Agent | `apps/router-agent`: the Hugging Face MCP agent loop with the router as its model and the Hugging Face skills |

## Verified

- Tests (`cargo test -p ai-router`): failover after a rate limit, offers without credentials never tried, Anthropic and Google answers translated to chat completions, local server first through the C ABI, the service answering OpenAI and Anthropic clients. CI builds and tests on Linux, Windows and macOS (`.github/workflows/ai-router.yml`), including the Bun binding against each build.
- Live: on Windows, the CI build found three local servers (Ollama, llama.cpp server, LM Studio) and over 8,000 catalog offers, answered through a local model as CLI and as a service (OpenAI and Anthropic endpoints).

## Not yet

Inference types other than text chat (images, audio, embeddings), native mobile apps (the web app is installable on mobile; a native build over the C ABI with a platform HTTPS transport is not done), and streaming from Anthropic or Google upstreams (their answers arrive as one chunk).
