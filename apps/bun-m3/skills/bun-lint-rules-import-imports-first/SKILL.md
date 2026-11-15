---
name: bun-lint-rules-import-imports-first
description: "Require all imports to come before every other statement (old name of `import/first`). Use when working with Bun: import/imports-first (bun docs lint/rules/import/imports-first.mdx)."
---

# import/imports-first

This is the old, deprecated name of `import/first`. It does the same thing and takes the same options. Use `import/first` instead.

Imports are hoisted. The imported modules load and run before any line of the file that imports them, no matter where the `import` is written. An import below other code looks like it runs later, but it doesn't.

`--fix` moves the imports to the top, after the ones that are already there.

## Examples

Reported:

{/* bad */}
```js

loadConfig(); // runs after "./server.js" has loaded, not before

startServer();
```

Not reported:

{/* good */}
```js

loadConfig();
startServer();
```

## Options

| Option | What it does |
| --- | --- |
| `"disable-absolute-first"` (default) | Imports can be in any order. |
| `"absolute-first"` | Also report an import of a package, or any path that doesn't start with `.`, after a relative import. |

{/* bad {"options": ["absolute-first"]} */}
```js
```
