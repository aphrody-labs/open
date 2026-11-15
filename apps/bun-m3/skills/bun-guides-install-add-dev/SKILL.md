---
name: bun-guides-install-add-dev
description: "Add a development dependency. Use when working with Bun: Add a development dependency (bun docs guides/install/add-dev.mdx)."
---

# Add a development dependency

To add an npm package as a development dependency, use `bun add --development`.

```sh terminal icon="terminal"
bun add zod --dev
bun add zod -d # shorthand
```

---

This adds the package to `devDependencies` in `package.json`.

```json
{
  "devDependencies": {
    "zod": "^4.0.0" // [!code ++]
  }
}
```

---

See [`bun install`](/pm/cli/install).
