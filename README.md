# open

Aphrody open ecosystem monorepo: the anomalyco repositories (opencode, opentui, sst, openauth, models.dev, ...) plus OpenAI and OpenAPI ecosystem repositories, flattened into one tree without upstream history. Target toolchain: Bun AOT + Rust LTO.

## Layout

- `crates/<name>`: Rust repositories.
- `packages/<name>`: TypeScript, JavaScript, Astro, MDX, HTML and SCSS repositories.
- `extra/<name>`: everything else (Go, Swift, Python, Zig, C, Ruby, Tree-sitter, no language).
- `ecosystem/<owner>-<name>`: OpenAI, OpenAPI and hey-api repositories.
- `docs/security/gitleaks.md`: secret scan summary of the imported code.

## Provenance

`open.lock.json` records for each import: upstream `url`, pinned `rev` (commit SHA), destination `path`, `language`, `archived`, `fork`, `license` (SPDX), `dropped_files` (files over 50 MB removed) and `submodules` (upstream submodules, not followed). Only tracked files at that revision are exported: no history, no nested `.git`. Upstream LICENSE files are kept.

## Rebuild

```sh
bun scripts/sync.ts            # re-export every entry at its pinned rev
bun scripts/sync.ts --update   # move every entry to its upstream default branch HEAD and rewrite the lock
bun scripts/sync.ts --only opencode,sst
```

`scripts/sync.ts` rebuilds the imported directories from `open.lock.json`; root files are authored here.
