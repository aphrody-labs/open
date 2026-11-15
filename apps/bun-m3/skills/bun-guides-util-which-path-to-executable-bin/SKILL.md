---
name: bun-guides-util-which-path-to-executable-bin
description: "Get the path to an executable bin file. Use when working with Bun: Get the path to an executable bin file (bun docs guides/util/which-path-to-executable-bin.mdx)."
---

# Get the path to an executable bin file

`Bun.which` finds the absolute path of an executable file, like the `which` command on Unix-like systems.

```ts foo.ts icon="/icons/typescript.svg"
Bun.which("sh"); // => "/bin/sh"
Bun.which("notfound"); // => null
Bun.which("bun"); // => "/home/user/.bun/bin/bun"
```

---

See [`Bun.which`](/runtime/utils#bun-which).
