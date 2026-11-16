set shell := ["bash", "-cu"]

default:
    @just --list

# Install the Bun workspaces (packages, apps, extension).
install:
    bun install

# cargo check over the whole workspace (run on a build host).
check:
    bun scripts/opentui-native.ts
    cargo check --workspace --all-targets

# Release build of the `open` command: fat LTO, one codegen unit.
release *features:
    bun scripts/opentui-native.ts
    cargo build --release -p open {{ if features == "" { "" } else { "--features " + features } }}

# MV3 extension into extension/dist.
extension:
    bun --cwd extension build.ts

# bun test per package (never root-wide): just test-ts [name-or-path ...]
test-ts *pkgs:
    bun scripts/test-ts.ts {{pkgs}}

# Rewrite the pins table of docs/upstream.md (--check: compare with each upstream head).
upstream *args:
    bun scripts/upstream.ts {{args}}

# No private data of this machine in first-party files (terms read live): just private [--fleet <file>]
private *args:
    bun scripts/check/private.ts {{args}}
