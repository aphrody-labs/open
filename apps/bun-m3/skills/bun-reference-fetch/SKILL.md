---
name: bun-reference-fetch
description: "Bun API reference from bun-types fetch.d.ts: 1 documented declarations with examples (All)."
---

# fetch

## `All`

Gets all values for the given header name.

Only `"Set-Cookie"` is supported. Any other header name returns an empty array.

```ts
const headers = new Headers();
headers.append("Set-Cookie", "foo=bar");
headers.append("Set-Cookie", "baz=qux");
headers.getAll("Set-Cookie"); // ["foo=bar", "baz=qux"]
```

