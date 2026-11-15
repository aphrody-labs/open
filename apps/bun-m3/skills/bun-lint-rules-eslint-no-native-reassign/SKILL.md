---
name: bun-lint-rules-eslint-no-native-reassign
description: "Disallow assignments to built-in and other read-only global variables. Use when working with Bun: no-native-reassign (bun docs lint/rules/eslint/no-native-reassign.mdx)."
---

# no-native-reassign

Nothing stops you from writing `Object = null`. Every piece of code that runs afterwards, including libraries, sees the new value and breaks far from the assignment. Most of the time it's a typo or a missing `const`.

The rule reports every write to a global that's marked as read-only, including writes with `+=`, `++` or destructuring. Your own variable with the same name is fine.

ESLint has deprecated this rule. `no-global-assign` is its current name and does the same thing.

## Examples

Reported:

{/* bad */}
```js
Promise = require("bluebird");
```

{/* bad {"count": 2} */}
```js
[Map, Set] = polyfills;
```

Not reported:

{/* good */}
```js
const Promise = require("bluebird");
```

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `exceptions` | `[]` | Names of globals that can be assigned to. |

{/* good {"options": [{"exceptions": ["Promise"]}]} */}
```js
Promise = require("bluebird");
```
