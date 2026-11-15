Done: features.csv checked (every row has yes, partial, no or skip; skips carry reasons; fixed notes that ran into the OpenAPI source text); parity.md regenerated: features 9.9, must-haves done 0/42 (partial counts half, none fully yes). Verdict: not shippable.
Behaviour: crates/hub passes 14 huggingface_hub calls (read, create, upload_file, upload_folder with LFS, search, commits); original also serves Xet upload (clone 404 on xet-write-token, run with HF_HUB_DISABLE_XET=1), users, orgs, discussions, collections, jobs, buckets, tokens minting.
Not done: layout diff (no clone screenshots yet), hf-hub (Rust) and @huggingface/hub client runs.
Build next: users/orgs/tokens API, collections, buckets, discussions, jobs; then Xet and Material 3 repo tabs.
