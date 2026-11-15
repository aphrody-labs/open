---
name: bun-guides-runtime-import-json
description: "Import a JSON file. Use when working with Bun: Import a JSON file (bun docs guides/runtime/import-json.mdx)."
---

# Import a JSON file

Bun natively supports `.json` imports.

```json package.json icon="file-json"
{
  "name": "bun",
  "version": "1.0.0",
  "author": {
    "name": "John Dough",
    "email": "john@dough.com"
  }
}
```

---

Import the file like any other source file.

```ts data.ts icon="/icons/typescript.svg"

data.name; // => "bun"
data.version; // => "1.0.0"
data.author.name; // => "John Dough"
```

---

Bun also supports [Import Attributes](https://github.com/tc39/proposal-import-attributes/) and [JSON modules](https://github.com/tc39/proposal-json-modules) syntax.

```ts data.ts icon="/icons/typescript.svg"

data.name; // => "bun"
data.version; // => "1.0.0"
data.author.name; // => "John Dough"
```

---

See [TypeScript](/runtime/typescript) for more on using TypeScript with Bun.
