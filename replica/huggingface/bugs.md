# Bugs (round 1, huggingface_hub 2.4.0 against crates/hub, on the build host)

| ID | Sev | Bug | Status |
|---|---|---|---|
| B1 | S1 | `commitUrl` relative: `upload_file` and `delete_file` raised `HfUriError` | fixed in crates/hub/src/main.rs, tested |
| B2 | S1 | LFS upload href carried no credentials: PUT /lfs-upload answered 401, `upload_folder` of a large file failed | fixed: batch href carries `?auth=` of the caller |
| B3 | S2 | `GET /api/models/{ns}/{repo}/commits/{rev}` missing (404), `list_repo_commits` failed | fixed: commit log per revision |
| B4 | S2 | With `hf_xet` installed (default) uploads of LFS files call `/xet-write-token` (404) | open: Xet not built; run with `HF_HUB_DISABLE_XET=1` |

To check: `?auth=` puts the token in a URL (logs); replace by a signed short-lived value. Mirror HEAD redirects, git smart protocol, hf-hub (Rust) and @huggingface/hub clients not run.
Test: crates/hub/tests/hf_client.py (`HF_ENDPOINT=... HF_HUB_DISABLE_XET=1 python hf_client.py`).

## Review after round 1

| ID | Sev | Bug | Status |
|---|---|---|---|
| B5 | S1 | `?auth=` put the caller's token in the LFS upload URL | fixed: upload links signed with HMAC-SHA256 for the object and user, one-hour expiry; test |
| B6 | S1 | files read whole into memory for downloads, uploads and mirror answers (8 GiB default body) | fixed: streamed to and from disk, SHA-256 checked while writing, 1 GiB default body for JSON and commits |
| B7 | S2 | one request at a time: a long download blocked every client | fixed: one thread per request |
| B8 | S1 | mirror: the upstream's `/api/resolve-cache/...` redirect answered 404, and HEAD answered `Content-Length: 0`; `hf_hub_download` wrote empty files | fixed: unknown Hub APIs mirrored, HEAD of a 200 answer fetches and caches the body and answers its exact length; checked with huggingface_hub against huggingface.co |
