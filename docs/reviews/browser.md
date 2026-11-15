# Import review: packages/browser

Bun binding of the Lightpanda fork (`packages/browser/native`), moved from the Aphrody monorepo (3a4463101), checked against decision D25.

| Check | Finding | Outcome |
|---|---|---|
| Verification | `bun test packages/browser`: 1 test, the TypeScript fallback when the native core is not built | passes |
| Purification | a V8 locator looked for builds inside the source repository's `third_party/` (rusty_v8, Chromium V8); `APHRODY_BROWSER_LIB`, `APHRODY_V8_LIB`; tests on the project's production site | locator removed (Lightpanda carries its own V8); library path `BROWSER_LIB`; tests on `example.com`; private-data gate clean |
| Purge | the V8 locator served the source repository's layout only | removed |
| Naming (D23) | package `@aphrody/browser` | kept: registry scope (rule 2) |
