set shell := ["bash", "-cu"]

default:
    @just --list

# Install all workspace dependencies (writes bun.lock on first run).
install:
    bun install

# Regenerate workspaces in package.json and docs/workspaces.md.
workspaces:
    bun scripts/workspaces.ts --write

# Compile every workspace CLI: just aot [--only opencode] [--targets bun-linux-x64]
aot *args:
    bun scripts/aot.ts {{args}}

# bun test per package (never root-wide): just test-ts [name-or-path ...]
test-ts *pkgs:
    bun scripts/test-ts.ts {{pkgs}}

# No private data of this machine in first-party files (terms read live; decision D24): just private [--fleet <file>]
private *args:
    bun scripts/check/private.ts {{args}}
