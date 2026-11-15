---
name: bun-guides-util-import-meta-file
description: "Get the file name of the current file. Use when working with Bun: Get the file name of the current file (bun docs guides/util/import-meta-file.mdx)."
---

# Get the file name of the current file

Bun provides a handful of module-specific utilities on the [`import.meta`](/runtime/module-resolution#import-meta) object. Use `import.meta.file` to retrieve the name of the current file.

```ts /a/b/c.ts icon="/icons/typescript.svg"
import.meta.file; // => "c.ts"
```

---

See [`import.meta`](/runtime/module-resolution#import-meta).
