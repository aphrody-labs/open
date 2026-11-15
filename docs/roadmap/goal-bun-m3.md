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
| Code examples | 9,592 fenced blocks parsed by remark-mdx (1 page falls back to Markdown); 6,896 runnable (TS/JS, `bun test` files, `bun` commands) |
| Reference examples | bun-types JSDoc (the source of bun.com/reference): 17 declaration files with examples, 667 examples, 645 runnable |
| API surface | 407 entries read from the running Bun: 117 top-level `Bun.*` plus walked namespaces, `bun:sqlite` 5, `bun:ffi` 14, `bun:jsc` 37, `bun:test` 21; `bun:bundle` is build-time only; environment variables and arguments are data, not API, and are not listed |
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
| 6 | Application: one page per skill; each example runs on the server in a sandbox (`runner.ts`); the docs' MDX components render as Angular Material components (`web/app/blocks.ts`) | rendered and run in Chrome | done |
| 7 | `bun build.ts`: `Bun.build` with `compile.aot`, every runtime feature kept (`trim.allow` = all `Bun.Build.TrimFeature`), skills embedded as assets | executable serves the client and runs the examples as `bun` (`BUN_BE_BUN`) | done |
| 8 | Coverage report (`/coverage`): Bun API entries accessed by the executed examples, recorded at run time; M3 components rendered, read from the DOM | the exact list of gaps | done, gaps listed below |

Decision D19: the M3 components of the app are Angular Material.

## How it works

- `gen/sources.ts`: sparse, shallow checkout of the fork (docs, bun-types); `sources.json` records the revision.
- `gen/skills.ts`, `gen/pages.ts`, `gen/reference.ts`: skills, render trees (remark-mdx, Markdown by `Bun.markdown`), runnable examples; tab and group of each page come from the site navigation (`docs.json`).
- `gen/theme.ts`, `gen/mat-sys.ts`: Theme Builder scheme from the press kit icon; Angular Material `--mat-sys-*` for three contrast levels.
- `runner.ts`: each page gets a working directory outside any project (its own `package.json` and `bunfig.toml` with `run.bun`, so `node` is an alias of Bun; home, temp, AppData and XDG directories inside it; no global binaries and no Node.js on `PATH`). Every run is confined: bubblewrap on Linux (read-only root, private `/tmp` and home, own PID, IPC and UTS namespaces), a Job Object on Windows (the whole process tree ends on timeout and after every run). Calls and reads of `Bun` and of `bun` / `bun:*` exports go through a recording proxy that unwraps itself before native code; examples that act outside the directory (global installs, upgrade, publish, trust, login, OS credential store, clipboard, editor) are skipped; a server example that keeps serving until the timeout is `serving`.
- `server.ts`: `Bun.serve` routes with the HTML import of the Angular client, the run API, server-sent events, the coverage report; results in `bun:sqlite`.

## Known limits

- Angular runs in JIT mode: Angular's template compiler needs the TypeScript 6 compiler API (angular/angular#69704) and TypeScript 7 has none before 7.1; the project ships no TypeScript 6. The client moves to Angular AOT when compiler-cli supports TypeScript 7.
- Bun's development server (HMR bundle) leaves rxjs `EMPTY` undefined for Angular Material's expansion panel; the production bundle is correct, so the app is served with `NODE_ENV=production`. To report upstream from the fork.
- On Windows a run can still read the user's files and use the network; full isolation is the Linux run (bubblewrap), which is where the reference numbers come from.
- A doc example is a fragment: many fail without the context the prose describes (missing files, servers, credentials). Failures are reported as they are, not hidden.
- Angular Material has no implementation of 7 of the 37 M3 components (button group, carousel, FAB menu, loading indicator, navigation bar, navigation rail, split button) and partial ones for 5 (search, side sheet, time picker, toolbar, tooltip): `kit/angular-material.json`. Covering them needs another official implementation (Compose Multiplatform or Flutter, D4).

Note on "LTO": Bun AOT compiles the JavaScript program to machine code and embeds the Bun runtime; LTO applies to the native side, i.e. the build of the Bun runtime itself (fork) and any native library the application links.
