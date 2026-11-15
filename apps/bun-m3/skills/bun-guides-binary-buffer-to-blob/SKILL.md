---
name: bun-guides-binary-buffer-to-blob
description: "Convert a Buffer to a blob. Use when working with Bun: Convert a Buffer to a blob (bun docs guides/binary/buffer-to-blob.mdx)."
---

# Convert a Buffer to a blob

You can construct a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) from an array of "chunks", where each chunk is a string, binary data structure (including `Buffer`), or another `Blob`.

```ts
const buf = Buffer.from("hello");
const blob = new Blob([buf]);
```

---

See [Binary Data](/runtime/binary-data#conversion).
