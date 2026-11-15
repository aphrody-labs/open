---
name: bun-guides-install-add
description: "Add a dependency. Use when working with Bun: Add a dependency (bun docs guides/install/add.mdx)."
---

# Add a dependency

To add an npm package as a dependency, use `bun add`.

```sh terminal icon="terminal"
bun add zod
```

---

This adds the package to `dependencies` in `package.json`. By default, Bun uses the `^` range specifier, which accepts future minor and patch versions.

```json package.json icon="file-json"
{
  "dependencies": {
    "zod": "^4.0.0" // [!code ++]
  }
}
```

---

To pin your project to the exact version you installed, use `--exact`. This adds the package to `dependencies` without the `^`.

```sh terminal icon="terminal"
bun add zod --exact
```

---

To specify an exact version or a tag:

```sh terminal icon="terminal"
bun add zod@3.0.0
bun add zod@next
```

---

See [`bun install`](/pm/cli/install).
