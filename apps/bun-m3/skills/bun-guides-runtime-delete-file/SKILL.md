---
name: bun-guides-runtime-delete-file
description: "Delete files. Use when working with Bun: Delete files (bun docs guides/runtime/delete-file.mdx)."
---

# Delete files

To delete a file, use `Bun.file(path).delete()`.

```ts delete-file.ts icon="/icons/typescript.svg"
// Delete a file
const file = Bun.file("path/to/file.txt");
await file.delete();

// Now the file doesn't exist
const exists = await file.exists();
// => false
```

---

See [File I/O](/runtime/file-io) for more filesystem operations.
