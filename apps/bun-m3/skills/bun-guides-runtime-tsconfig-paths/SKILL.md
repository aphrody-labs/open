---
name: bun-guides-runtime-tsconfig-paths
description: "Re-map import paths. Use when working with Bun: Re-map import paths (bun docs guides/runtime/tsconfig-paths.mdx)."
---

# Re-map import paths

Bun reads the `paths` field in your `tsconfig.json` to re-write import paths. This is useful for aliasing package names or avoiding long relative paths.

```json tsconfig.json icon="file-json"
{
  "compilerOptions": {
    "paths": {
      "my-custom-name": ["./node_modules/zod"],
      "@components/*": ["./src/components/*"]
    }
  }
}
```

---

With this `tsconfig.json`, Bun re-writes the following imports:

```ts tsconfig.ts icon="/icons/typescript.svg"
```

---

See [TypeScript](/runtime/typescript).
