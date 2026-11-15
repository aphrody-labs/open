---
name: bun-guides-util-file-url-to-path
description: "Convert a file URL to an absolute path. Use when working with Bun: Convert a file URL to an absolute path (bun docs guides/util/file-url-to-path.mdx)."
---

# Convert a file URL to an absolute path

Use `Bun.fileURLToPath()` to convert a `file://` URL to an absolute path.

```ts
Bun.fileURLToPath("file:///path/to/file.txt");
// => "/path/to/file.txt"
```

---

See [Utils](/runtime/utils).
