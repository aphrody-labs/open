---
name: bun-lint-rules-eslint-no-buffer-constructor
description: "Disallow the deprecated `Buffer()` constructor. Use when working with Bun: no-buffer-constructor (bun docs lint/rules/eslint/no-buffer-constructor.mdx)."
---

# no-buffer-constructor

`Buffer(value)` does different things depending on the type of `value`. A string is copied, and a number allocates that many bytes. If `value` comes from a request, a caller who sends a number where you expect a string gets to decide how much memory your server allocates.

Node.js has deprecated the constructor. `Buffer.from()`, `Buffer.alloc()` and `Buffer.allocUnsafe()` each do one thing, and `Buffer.from()` throws if it gets a number.

ESLint has deprecated this rule. Its replacement, `n/no-deprecated-api` from `eslint-plugin-n`, isn't built into `bun lint`.

## Examples

Reported:

{/* bad {"count": 2} */}
```js
const header = new Buffer(16);
const name = Buffer("Ada", "utf8");
```

Not reported:

{/* good */}
```js
const header = Buffer.alloc(16);
const name = Buffer.from("Ada", "utf8");
```
