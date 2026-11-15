---
name: bun-guides-util-deflate
description: "Compress and decompress data with DEFLATE. Use when working with Bun: Compress and decompress data with DEFLATE (bun docs guides/util/deflate.mdx)."
---

# Compress and decompress data with DEFLATE

Use `Bun.deflateSync()` to compress a `Uint8Array` with DEFLATE.

```ts
const data = Buffer.from("Hello, world!");
const compressed = Bun.deflateSync(data);
// => Uint8Array

const decompressed = Bun.inflateSync(compressed);
// => Uint8Array
```

---

See [Utils](/runtime/utils).
