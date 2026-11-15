---
name: bun-guides-runtime-import-toml
description: "Import a TOML file. Use when working with Bun: Import a TOML file (bun docs guides/runtime/import-toml.mdx)."
---

# Import a TOML file

Bun natively supports importing `.toml` files.

```toml data.toml icon="file-code"
name = "bun"
version = "1.0.0"

[author]
name = "John Dough"
email = "john@dough.com"
```

---

Import the file like any other source file.

```ts data.ts icon="/icons/typescript.svg"

data.name; // => "bun"
data.version; // => "1.0.0"
data.author.name; // => "John Dough"
```

---

See [TypeScript](/runtime/typescript) for more on using TypeScript with Bun.
