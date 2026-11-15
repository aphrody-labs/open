---
name: bun-guides-write-file-cat
description: "Write a file to stdout. Use when working with Bun: Write a file to stdout (bun docs guides/write-file/cat.mdx)."
---

# Write a file to stdout

Bun exposes `stdout` as a `BunFile` with the `Bun.stdout` property. Pass it as the destination to [`Bun.write()`](/runtime/file-io#writing-files-bun-write).

The following code writes a file to `stdout`, like the Unix `cat` command.

```ts cat.ts icon="/icons/typescript.svg"
const path = "/path/to/file.txt";
const file = Bun.file(path);
await Bun.write(Bun.stdout, file);
```

---

See [`Bun.write()`](/runtime/file-io#writing-files-bun-write).
