---
name: bun-lint-rules-typescript-no-loss-of-precision
description: "Disallow number literals that cannot be stored exactly as written. Use when working with Bun: @typescript-eslint/no-loss-of-precision (bun docs lint/rules/typescript/no-loss-of-precision.mdx)."
---

# @typescript-eslint/no-loss-of-precision

A JavaScript number holds 15 to 17 significant digits. A literal that needs more is rounded without a warning, so the program runs with a different number than the one in the source. This often happens with IDs copied from a database.

Use a `bigint` or a string for a large integer.

This rule is deprecated. Use `no-loss-of-precision` instead.

## Examples

Reported:

{/* bad {"count": 2} */}
```ts
const orderId = 9007199254740993; // stored as 9007199254740992
const limit = 2e999; // stored as Infinity
```

Not reported:

{/* good */}
```ts
const orderId = 9007199254740993n;
const invoiceId = "9007199254740993";
const rate = 0.3;
const limit = Number.MAX_VALUE;
```
