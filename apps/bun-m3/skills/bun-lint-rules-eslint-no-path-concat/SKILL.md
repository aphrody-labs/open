---
name: bun-lint-rules-eslint-no-path-concat
description: "Disallow building paths with `+` from `__dirname` or `__filename`. Use when working with Bun: no-path-concat (bun docs lint/rules/eslint/no-path-concat.mdx)."
---

# no-path-concat

A path built with `+` has the separator written into the string. `__dirname + "/config.json"` mixes `\` and `/` on Windows, and a forgotten slash gives you the wrong path without an error. `path.join()` and `path.resolve()` put in the right separator and clean up `..` and doubled slashes.

ESLint has deprecated this rule. Use `n/no-path-concat` instead.

## Examples

Reported:

{/* bad */}
```js
const configPath = __dirname + "/config.json";
```

Not reported:

{/* good */}
```js
const path = require("node:path");

const configPath = path.join(__dirname, "config.json");
```

Only `+` is checked. A template literal has the same problem, but it isn't reported:

{/* good */}
```js
const configPath = `${__dirname}/config.json`;
```
