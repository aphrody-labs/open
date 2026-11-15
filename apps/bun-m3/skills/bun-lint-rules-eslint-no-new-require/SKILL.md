---
name: bun-lint-rules-eslint-no-new-require
description: "Disallow `new require(..)`. Use when working with Bun: no-new-require (bun docs lint/rules/eslint/no-new-require.mdx)."
---

# no-new-require

In `new require("./server")`, the `new` applies to `require`, not to what it returns, so you don't get an instance of the exported class. To create one in a single expression, put the `require` call in parentheses, or use two statements.

ESLint has deprecated this rule. Use `n/no-new-require` instead.

## Examples

Reported:

{/* bad */}
```js
const server = new require("./server");
```

Not reported:

{/* good */}
```js
const Server = require("./server");
const server = new Server();

const logger = new (require("./logger"))();
```
