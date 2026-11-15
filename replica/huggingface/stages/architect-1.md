Done: architecture.md, schema.sql (16 tables), crates/hub read path (info, tree, resolve with ETag, X-Repo-Commit, Accept-Ranges; mirror cache) added to the workspace.
Not done: crates/hub is not compiled (Rust builds on the build host or CI) and has no tests; X-Linked-* headers, Range, git and LFS, write path, search, auth, Xet and the UI are not built.
features.csv: repo APIs marked partial, billing and site content marked skip with reasons, the rest no.
