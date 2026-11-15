# Brief: the Hugging Face Hub infrastructure, self-hosted in open

Goal: every service of huggingface.co that a user or a client library relies on, runnable on any deployment from
this repository, with the AI layer of open (crates/ai-router, apps/router-agent) at its centre.

## Contract

- Clients work unchanged against it by setting `HF_ENDPOINT`: `huggingface_hub` (Python, `hf` CLI),
  `@huggingface/hub` and `@huggingface/transformers` (JavaScript), `hf-hub` (Rust), git with LFS.
- The published Hub API description (`/.well-known/openapi.json`, summarised in `sources/*.md` and searchable
  with `ask`) is the reference for paths, parameters and answers. Answers keep the same field names.
- Mirror mode: a repository not hosted locally is fetched from an upstream Hub (`HUB_UPSTREAM`), cached by
  content hash and served from the cache afterwards; hosted mode: repositories created and pushed locally.

## Parts and the upstream code to build on

| Part | Build on |
|---|---|
| Repositories (models, datasets, spaces, buckets, kernels): info, tree, revisions, commits, resolve, upload (preupload, commit, LFS batch) | Rust crate `crates/hub` in open, following the OpenAPI description; storage by content hash |
| Large-file storage (Xet): chunked, deduplicated transfer | `huggingface/xet-core` (Rust) |
| Mounting repositories and buckets as file systems | `huggingface/hf-mount`, `huggingface/nfsserve` |
| Inference routing (Inference Providers, `router.huggingface.co/v1`) | `crates/ai-router` (already speaks OpenAI and Anthropic clients; Hugging Face providers come from the models.dev catalog with `HF_TOKEN`) |
| Local inference: text generation, embeddings, rerank | `huggingface/text-embeddings-inference`, `huggingface/candle`, local OpenAI-compatible servers discovered by ai-router |
| Responses API over chat completions | `huggingface/responses.js` |
| MCP server of the Hub | `huggingface/hf-mcp-server` |
| Chat (HuggingChat) | `huggingface/chat-ui`, pointed at ai-router |
| Agents and skills | `apps/router-agent` (`@huggingface/mcp-client`, `huggingface/skills`) |
| Jobs and sandboxes | `huggingface/sandbox-server` |
| Dataset viewer | `huggingface/dataset-viewer` |
| Web UI of the Hub (lists, repository pages, files, settings) | Material 3 components from the design system of open |

## Order

1. `crates/hub`: read path (model, dataset and space info, tree, resolve with the headers clients read:
   `X-Repo-Commit`, `ETag`, `X-Linked-Etag`, `X-Linked-Size`, ranges), mirror mode, tests with `huggingface_hub`
   and `hf-hub` downloads.
2. Write path: create repository, preupload, commit (NDJSON), LFS batch with basic transfer; tests with
   `upload_file` and `upload_folder`.
3. Search and listing (`/api/models`, `/api/datasets`, `/api/spaces` with search, author, sort, limit).
4. Users, organisations, tokens (`whoami-v2`), access control for private repositories.
5. Xet storage through xet-core; mounting through hf-mount.
6. Web UI, then chat-ui, dataset viewer, jobs.

Out of scope: the site's own content (models, datasets and spaces its users uploaded, their discussions, papers,
blog posts), billing and partner contracts; they are reached through mirror mode, never copied in bulk.
