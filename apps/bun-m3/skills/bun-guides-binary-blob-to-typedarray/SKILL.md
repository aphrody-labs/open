---
name: bun-guides-binary-blob-to-typedarray
description: "Convert a Blob to a Uint8Array. Use when working with Bun: Convert a Blob to a Uint8Array (bun docs guides/binary/blob-to-typedarray.mdx)."
---

# Convert a Blob to a Uint8Array

The [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) class provides several methods for consuming its contents in different formats. Use `.bytes()` to read the contents as a `Uint8Array`.

```ts
const blob = new Blob(["hello world"]);
const arr = await blob.bytes();
```

Alternatively, read the contents into an `ArrayBuffer` with `.arrayBuffer()`, then create a `Uint8Array` from the buffer.

```ts
const blob = new Blob(["hello world"]);
const arr = new Uint8Array(await blob.arrayBuffer());
```

---

See [Binary Data](/runtime/binary-data#conversion).
