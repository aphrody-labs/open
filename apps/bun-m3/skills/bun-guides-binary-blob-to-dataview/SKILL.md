---
name: bun-guides-binary-blob-to-dataview
description: "Convert a Blob to a DataView. Use when working with Bun: Convert a Blob to a DataView (bun docs guides/binary/blob-to-dataview.mdx)."
---

# Convert a Blob to a DataView

The [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) class provides several methods for consuming its contents in different formats. Read the contents into an `ArrayBuffer` with `.arrayBuffer()`, then create a `DataView` from the buffer.

```ts
const blob = new Blob(["hello world"]);
const arr = new DataView(await blob.arrayBuffer());
```

---

See [Binary Data](/runtime/binary-data#conversion).
