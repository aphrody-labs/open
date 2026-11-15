---
name: bun-guides-util-import-meta-path
description: "Get the absolute path of the current file. Use when working with Bun: Get the absolute path of the current file (bun docs guides/util/import-meta-path.mdx)."
---

# Get the absolute path of the current file

Bun provides a handful of module-specific utilities on the [`import.meta`](/runtime/module-resolution#import-meta) object. Use `import.meta.path` to retrieve the absolute path of the current file.

```ts /a/b/c.ts icon="/icons/typescript.svg"
import.meta.path; // => "/a/b/c.ts"
```

---

See [`import.meta`](/runtime/module-resolution#import-meta).
