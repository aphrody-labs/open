---
name: bun-lint-rules-eslint-no-catch-shadow
description: "Disallow a `catch` parameter with the name of a variable in the scope around it. Use when working with Bun: no-catch-shadow (bun docs lint/rules/eslint/no-catch-shadow.mdx)."
---

# no-catch-shadow

In Internet Explorer 8 and earlier, a `catch` clause's parameter leaks into the surrounding scope. If a variable there has the same name, the caught error overwrites it.

The rule reports a `catch` parameter that has the same name as a variable, function, class or global that's visible at the `try` statement.

ESLint has deprecated this rule. Use `no-shadow` instead.

## Examples

Reported:

{/* bad */}
```js
const error = loadLastError();

try {
  save();
} catch (error) {
  console.log(error);
}
```

Not reported:

{/* good */}
```js
const error = loadLastError();

try {
  save();
} catch (saveError) {
  console.log(saveError);
}
```

## When not to use it

Every current browser and runtime keeps the parameter inside the `catch` clause, so this rule only matters for Internet Explorer 8. It's deprecated. To stop names from hiding each other, use `no-shadow`.
