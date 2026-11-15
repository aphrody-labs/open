---
name: bun-lint-rules-eslint-id-blacklist
description: "Disallow the identifier names you list (old name of `id-denylist`). Use when working with Bun: id-blacklist (bun docs lint/rules/eslint/id-blacklist.mdx)."
---

# id-blacklist

This is the old name for `id-denylist`. It takes the same options. Use `id-denylist` in new configs.

Names like `data`, `tmp` or `cb` don't say much about what they hold. The rule reports the names you list when they name a variable, parameter, function, class, import, object key or class member, or a property you assign to. Without a list, it reports nothing.

## Examples

```toml bunfig.toml
[lint.rules]
id-blacklist = ["error", "data", "callback"]
```

Reported:

{/* bad {"options": ["data", "callback"], "count": 4} */}
```js
const data = loadUser(id);

function save(user, callback) {}

const response = { data: 1 };
response.data = 2;
```

Not reported:

{/* good {"options": ["data", "callback"]} */}
```js
const user = loadUser(id);

function save(user, onSaved) {}

console.log(response.data);
```

Unlike `id-denylist`, this rule doesn't look at private names:

{/* good {"options": ["data"]} */}
```js
class Store {
  #data = new Map();
}
```

## Options

Each option is a name to disallow. Names are compared exactly, so `"data"` doesn't match `userData`.
