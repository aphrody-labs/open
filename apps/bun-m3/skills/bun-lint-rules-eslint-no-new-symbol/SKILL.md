---
name: bun-lint-rules-eslint-no-new-symbol
description: "Disallow `new Symbol()`. Use when working with Bun: no-new-symbol (bun docs lint/rules/eslint/no-new-symbol.mdx)."
---

# no-new-symbol

`Symbol` starts with a capital letter but isn't a constructor. `new Symbol("id")` throws a `TypeError` when it runs. Call it without `new`.

ESLint has deprecated this rule. Use `no-new-native-nonconstructor` instead, which also covers `BigInt`.

## Examples

Reported:

{/* bad */}
```js
const id = new Symbol("id");
```

Not reported:

{/* good */}
```js
const id = Symbol("id");
```
