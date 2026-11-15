---
name: bun-lint-rules-eslint-no-sync
description: "Disallow methods with a name that ends in `Sync`. Use when working with Bun: no-sync (bun docs lint/rules/eslint/no-sync.mdx)."
---

# no-sync

`fs.readFileSync()` and its relatives block the thread until the work is done. In a server, no other request gets handled in the meantime.

The rule only goes by the name. It reports every `object.somethingSync`, called or not, no matter what the object is. It doesn't catch a function that's imported by name, such as `import { readFileSync } from "node:fs"`.

ESLint has deprecated this rule. Use `n/no-sync` instead, which reports those calls too.

## Examples

Reported:

{/* bad */}
```js

function handle(request) {
  const page = fs.readFileSync("index.html", "utf8");
  return new Response(page);
}
```

Not reported:

{/* good */}
```js

async function handle(request) {
  const page = await fs.readFile("index.html", "utf8");
  return new Response(page);
}
```

This blocks the thread too, but the rule doesn't catch it:

{/* good */}
```js

const page = readFileSync("index.html", "utf8");
```

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `allowAtRootLevel` | `false` | Allow sync methods outside of functions, where they run once as the file loads. |

{/* good {"options": [{"allowAtRootLevel": true}]} */}
```js

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
```

{/* bad {"options": [{"allowAtRootLevel": true}]} */}
```js

function loadConfig() {
  return JSON.parse(fs.readFileSync("config.json", "utf8"));
}
```

## When not to use it

In a script or a command-line tool, nothing else is waiting for the thread, and the sync methods are simpler.
