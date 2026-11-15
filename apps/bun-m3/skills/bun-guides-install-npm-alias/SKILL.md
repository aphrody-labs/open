---
name: bun-guides-install-npm-alias
description: "Install a package under a different name. Use when working with Bun: Install a package under a different name (bun docs guides/install/npm-alias.mdx)."
---

# Install a package under a different name

To install an npm package under an alias:

```sh terminal icon="terminal"
bun add my-custom-name@npm:zod
```

---

You can now import the `zod` package as `my-custom-name`.

```ts index.ts icon="/icons/typescript.svg"

z.string();
```

---

See [`bun install`](/pm/cli/install).
