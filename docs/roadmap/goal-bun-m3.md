# Goal validation deliverable: Bun fullstack × Material 3

Owner criterion: the goal is validated only once this deliverable exists.

## Definition

A Bun 1.4.5 fullstack application, compiled to one executable (`bun build --compile`, AOT), that:

1. reads recursively **every** MDX page of the `aphrody-labs/bun` fork documentation;
2. converts each one into a **skill** in the Agent Skills format (usable by Vercel skills, Claude, Codex, ...);
3. for each skill, provides **a real usage of the feature described** (server code that calls it) and **a matching Material 3 component** that displays it;
4. embeds a **design system generated the way Material Theme Builder does** for every framework (web, Flutter, Compose, Android), whose source colour comes from Bun's assets and press kit;
5. **proves** with a coverage report that it uses every Bun API (surface read from the running Bun) and every component of the Figma Material 3 kit.

## Sources measured

| Source | Measure |
|---|---|
| Bun fork docs (`docs/**/*.mdx`) | 1,405 MDX files: lint 1,051, guides 195, runtime 67, pm 28, snippets 16, test 13, bundler 11, compiler 11, project 6, others 7 |
| Code examples | 9,609 fenced blocks in 1,397 pages; 6,899 runnable (TS/JS or `bun` commands) |
| API surface | 624 entries read from Bun 1.4.5: 117 top-level `Bun.*` plus walked namespaces, `bun:sqlite` 5, `bun:ffi` 14, `bun:jsc` 37, `bun:test` 21; `bun:bundle` is build-time only |
| Press kit | bun.com/press-kit: `presskit.zip`, `logo.svg`, `wordmark.svg`, `icon.svg`, PNG icons |
| Material 3 kit | Figma "Material 3 Design Kit": 169 assets (136 component sets) matching the 36 M3 components of m3.material.io |

## Steps

| # | Step | Proof | Status |
|---|---|---|---|
| 1 | Sources: sparse checkout of the fork (docs, bun-types), press kit | file counts, revision | done |
| 2 | MDX → skills (`SKILL.md` with `name` and `description`), one per page | 1,405 skills, format validated | done |
| 3 | Bun API surface | `api.json` | done |
| 4 | Theme Builder theme from the press kit: web CSS, Angular SCSS, Flutter, Compose, Android XML, Rust | source colour `#fdf3e1` traced to the icon | done |
| 5 | Figma M3 kit inventory | `kit/kit.json` | done |
| 6 | Application: one page per skill, real server-side usage (the page's own examples run by Bun) and an Angular Material component client-side | rendering in Chrome for Testing | in progress |
| 7 | `bun build --compile` (AOT) | executable launched | to do |
| 8 | Coverage report: Bun APIs and M3 kit components | 100% or the exact list of gaps | to do |

Decision D19: the M3 components of the app are Angular Material.

Note on "LTO": Bun AOT compiles the JavaScript program to machine code and embeds the Bun runtime; LTO applies to the native side, i.e. the build of the Bun runtime itself (fork) and any native library the application links.
