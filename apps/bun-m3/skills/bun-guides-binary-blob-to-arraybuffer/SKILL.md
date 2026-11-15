---
name: bun-guides-binary-blob-to-arraybuffer
description: "Convert a Blob to an ArrayBuffer. Use when working with Bun: Convert a Blob to an ArrayBuffer (bun docs guides/binary/blob-to-arraybuffer.mdx)."
---

# Convert a Blob to an ArrayBuffer

The [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) class provides several methods for consuming its contents in different formats, including `.arrayBuffer()`.

```ts
const blob = new Blob(["hello world"]);
const buf = await blob.arrayBuffer();
```

---

See [Binary Data](/runtime/binary-data#conversion).
