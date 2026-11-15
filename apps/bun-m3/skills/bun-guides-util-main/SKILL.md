---
name: bun-guides-util-main
description: "Get the absolute path to the current entrypoint. Use when working with Bun: Get the absolute path to the current entrypoint (bun docs guides/util/main.mdx)."
---

# Get the absolute path to the current entrypoint

The `Bun.main` property contains the absolute path to the current entrypoint.

```ts foo.ts icon="/icons/typescript.svg"
console.log(Bun.main);
```

```ts index.ts icon="/icons/typescript.svg"
```

---

The printed path is the file executed with `bun run`.

```sh terminal icon="terminal"
bun run index.ts
```

```txt
/path/to/index.ts
```

```sh terminal icon="terminal"
bun run foo.ts
```

```txt
/path/to/foo.ts
```

---

See [Utils](/runtime/utils).
