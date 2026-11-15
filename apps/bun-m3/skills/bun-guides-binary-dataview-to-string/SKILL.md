---
name: bun-guides-binary-dataview-to-string
description: "Convert a DataView to a string. Use when working with Bun: Convert a DataView to a string (bun docs guides/binary/dataview-to-string.mdx)."
---

# Convert a DataView to a string

If a [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) contains ASCII-encoded text, use the [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) class to convert it to a string.

```ts
const dv: DataView = ...;
const decoder = new TextDecoder();
const str = decoder.decode(dv);
```

---

See [Binary Data](/runtime/binary-data#conversion).
