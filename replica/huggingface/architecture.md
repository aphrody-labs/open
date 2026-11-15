# Architecture: open Hub (self-hosted Hugging Face Hub API, not the site's content)

## Stack

| layer | choice | why |
| --- | --- | --- |
| service | Rust crate `crates/hub` (tiny_http + ureq, like `crates/ai-router`) | contract is HTTP headers and JSON; same toolchain and CI as the router |
| database | SQLite single node, Postgres when shared (`schema.sql`) | one database, metadata only |
| blobs | content-addressed files by sha256 (disk, R2 on Cloudflare) | LFS and Xet both address by hash; mirror cache reuses it |
| large files | `huggingface/xet-core` behind `xet-read-token` and `xet-write-token` | milestone 5; LFS basic transfer first |
| mounts | `hf-mount`, `nfsserve` | milestone 5 |
| auth | bearer tokens (hash stored), `whoami-v2`, memberships | clients send `Authorization: Bearer hf_...` |
| inference | `crates/ai-router` at `/v1`, HF providers from models.dev + `HF_TOKEN` | already built |
| web | Material 3 components of open's design system over `/api` | milestone 6 |
| jobs | `huggingface/sandbox-server` | milestone 6 |
| hosting | any: static binary or container image like ai-router | no vendor lock |

## Schema

Tables: 16 (`schema.sql`). Access rules: data-layer checks, one authorisation function per query.

## API

Reference: the Hub OpenAPI description (`ask` searches `sources/*.md`); paths and field names are kept.

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| GET /api/{models,datasets,spaces}/{ns}/{repo} | repo info, siblings, sha | public; private by token | - | JSON | read |
| GET /api/{kind}/{ns}/{repo}/tree/{rev}/{path} | listing | same | - | JSON array | read |
| GET, HEAD /{ns}/{repo}/resolve/{rev}/{path} (datasets/, spaces/ prefixed) | file with X-Repo-Commit, ETag, X-Linked-Etag, X-Linked-Size, ranges | same | Range | bytes | read |
| GET /api/{kind}/{ns}/{repo}/refs, commits/{rev}; POST paths-info/{rev} | revisions | same | - | JSON | read |
| POST /api/repos/create | create repo | write token | name, type, private | url | write |
| POST /api/{kind}/{ns}/{repo}/preupload/{rev} | regular or lfs per file | write | files[] | uploadMode | write |
| POST /api/{kind}/{ns}/{repo}/commit/{rev} | NDJSON commit | write | header, file, lfsFile, deletedFile | commitOid | write |
| POST /{repo}.git/info/lfs/objects/batch | LFS basic transfer | write | objects[] | actions | write |
| GET /api/{models,datasets,spaces} | search, author, sort, limit | public | query | JSON | list |
| GET /api/whoami-v2, /api/users, /api/organizations | identity | token | - | JSON | auth |
| /v1/* | chat, responses, embeddings | token | OpenAI | OpenAI | inference (ai-router) |

Webhooks out: repo events. Jobs: mirror cache eviction (daily), LFS orphan cleanup (daily).

## The parts that bite

- mirror mode: ETag and X-Linked-Etag come from upstream or sha256, never recomputed per request; cache by content hash.
- idempotency: preupload and LFS batch are repeated by clients; commits keyed by parent oid.
- races: concurrent commits to one branch need compare-and-swap on `refs.commit_id`.
- ranges and size: resumable downloads need exact Content-Length and Accept-Ranges; multi-GB files streamed, never buffered.
- private repos: 404 not 403; gated repos return the headers clients read.
- git over HTTP: clone needs the smart protocol, deferred.

## Build order

1. Vertical slice (source written, not compiled): `crates/hub` read path, hosted plus mirror.
2. Write path (create, preupload, commit, LFS batch), search and listing, tokens and whoami, ai-router at /v1.
3. Xet, hf-mount, discussions, webhooks, collections.
4. Web UI, chat-ui, dataset viewer, jobs.
5. Fixes from replica-entrepreneur.
