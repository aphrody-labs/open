---
name: bun-lint-rules-eslint-no-new-object
description: "Disallow `new Object()` in favor of `{}`. Use when working with Bun: no-new-object (bun docs lint/rules/eslint/no-new-object.mdx)."
---

# no-new-object

`new Object()` creates the same empty object as `{}`. The literal is shorter and lets you list the properties in place.

ESLint has deprecated this rule. Use `no-object-constructor` instead, which also reports `Object()` without `new`.

## Examples

Reported:

{/* bad */}
```js
const headers = new Object();
headers.accept = "text/html";
```

Not reported:

{/* good */}
```js
const headers = { accept: "text/html" };
```
