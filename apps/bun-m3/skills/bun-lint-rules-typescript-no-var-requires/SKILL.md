---
name: bun-lint-rules-typescript-no-var-requires
description: "Disallow `const x = require()` in favor of `import`. Use when working with Bun: @typescript-eslint/no-var-requires (bun docs lint/rules/typescript/no-var-requires.mdx)."
---

# @typescript-eslint/no-var-requires

In a TypeScript file, `require()` returns `any`, so `const fs = require("node:fs")` loses all the module's types. An `import` keeps them.

The rule reports `require()` in a variable declaration, and where its result is called, passed to a function, read from with `.` or `[]`, or given a type with `as`. A bare `require("./setup");` and `import fs = require("fs")` are allowed, and so is your own function named `require`.

This rule is deprecated. Use `@typescript-eslint/no-require-imports` instead.

## Examples

Reported:

{/* bad {"count": 3} */}
```ts
const fs = require("node:fs");
const join = require("node:path").join;
register(require("./plugin"));
```

Not reported:

{/* good */}
```ts

require("./setup");
```

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `allow` | `[]` | Regular expressions. A `require()` of a path that matches one of them is allowed. |

{/* good {"options": [{"allow": ["/package\\.json$"]}]} */}
```ts
const pkg = require("../package.json");
```

{/* bad {"options": [{"allow": ["/package\\.json$"]}]} */}
```ts
const data = require("../data.json");
```
