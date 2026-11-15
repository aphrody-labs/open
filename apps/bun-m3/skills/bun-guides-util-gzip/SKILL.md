---
name: bun-guides-util-gzip
description: "Compress and decompress data with gzip. Use when working with Bun: Compress and decompress data with gzip (bun docs guides/util/gzip.mdx)."
---

# Compress and decompress data with gzip

Use `Bun.gzipSync()` to compress a `Uint8Array` with gzip.

```ts
const data = Buffer.from("Hello, world!");
const compressed = Bun.gzipSync(data);
// => Uint8Array

const decompressed = Bun.gunzipSync(compressed);
// => Uint8Array
```

---

See [Utils](/runtime/utils).
