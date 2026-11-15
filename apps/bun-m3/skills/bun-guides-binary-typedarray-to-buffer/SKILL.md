---
name: bun-guides-binary-typedarray-to-buffer
description: "Convert a Uint8Array to a Buffer. Use when working with Bun: Convert a Uint8Array to a Buffer (bun docs guides/binary/typedarray-to-buffer.mdx)."
---

# Convert a Uint8Array to a Buffer

The [`Buffer`](https://nodejs.org/api/buffer.html) class extends [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) with additional methods. Use `Buffer.from()` to create a `Buffer` instance from a `Uint8Array`.

```ts
const arr: Uint8Array = ...
const buf = Buffer.from(arr);
```

---

See [Binary Data](/runtime/binary-data#conversion).
