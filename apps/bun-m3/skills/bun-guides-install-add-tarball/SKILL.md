---
name: bun-guides-install-add-tarball
description: "Add a tarball dependency. Use when working with Bun: Add a tarball dependency (bun docs guides/install/add-tarball.mdx)."
---

# Add a tarball dependency

Bun's package manager can install a tarball URL as a dependency of your project. If the URL needs credentials, see [Tarball dependencies](/pm/cli/add#tarball-dependencies).

```sh terminal icon="terminal"
bun add zod@https://registry.npmjs.org/zod/-/zod-3.21.4.tgz
```

---

This command downloads, extracts, and installs the tarball into your project's `node_modules` directory, and adds the following line to your `package.json`:

```json package.json icon="file-json"
{
  "dependencies": {
    "zod": "https://registry.npmjs.org/zod/-/zod-3.21.4.tgz" // [!code ++]
  }
}
```

---

You can now import `zod` as usual.

```ts
```

---

See [`bun install`](/pm/cli/install).
