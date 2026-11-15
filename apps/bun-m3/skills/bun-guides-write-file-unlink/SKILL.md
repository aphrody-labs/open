---
name: bun-guides-write-file-unlink
description: "Delete a file. Use when working with Bun: Delete a file (bun docs guides/write-file/unlink.mdx)."
---

# Delete a file

The `Bun.file()` function accepts a path and returns a `BunFile` instance. Use the `.delete()` method to delete the file.

```ts
const path = "/path/to/file.txt";
const file = Bun.file(path);

await file.delete();
```

---

See [`Bun.file()`](/runtime/file-io#reading-files-bun-file).
