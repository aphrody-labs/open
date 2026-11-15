---
name: bun-lint-rules-eslint-no-negated-in-lhs
description: "Disallow negating the left operand of `in`. Use when working with Bun: no-negated-in-lhs (bun docs lint/rules/eslint/no-negated-in-lhs.mdx)."
---

# no-negated-in-lhs

`!` binds tighter than `in`, so `!key in cache` means `(!key) in cache`. It asks whether `cache` has a property named `"true"` or `"false"`, which is almost never the question. The negation belongs around the whole test.

ESLint has deprecated this rule. Use `no-unsafe-negation` instead, which also covers `instanceof`.

## Examples

Reported:

{/* bad */}
```js
if (!key in cache) {
  cache[key] = load(key);
}
```

Not reported:

{/* good */}
```js
if (!(key in cache)) {
  cache[key] = load(key);
}
```
