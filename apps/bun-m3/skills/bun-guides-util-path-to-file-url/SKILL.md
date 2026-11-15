---
name: bun-guides-util-path-to-file-url
description: "Convert an absolute path to a file URL. Use when working with Bun: Convert an absolute path to a file URL (bun docs guides/util/path-to-file-url.mdx)."
---

# Convert an absolute path to a file URL

Use `Bun.pathToFileURL()` to convert an absolute path to a `file://` URL.

```ts
Bun.pathToFileURL("/path/to/file.txt").href;
// => "file:///path/to/file.txt"
```

---

See [Utils](/runtime/utils).
