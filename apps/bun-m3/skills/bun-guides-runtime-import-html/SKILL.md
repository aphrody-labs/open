---
name: bun-guides-runtime-import-html
description: "Import a HTML file as text. Use when working with Bun: Import a HTML file as text (bun docs guides/runtime/import-html.mdx)."
---

# Import a HTML file as text

To import a `.html` file in Bun as a text file, use the `type: "text"` attribute in the import statement.

```ts file.ts icon="/icons/typescript.svg"

console.log(html); // <!DOCTYPE html><html><head>...
```

With hot module reloading or watch mode, Bun reloads whenever `./file.html` changes.
