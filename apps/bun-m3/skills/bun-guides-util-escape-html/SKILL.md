---
name: bun-guides-util-escape-html
description: "Escape an HTML string. Use when working with Bun: Escape an HTML string (bun docs guides/util/escape-html.mdx)."
---

# Escape an HTML string

`Bun.escapeHTML()` escapes HTML characters in a string. It makes the following replacements.

- `"` becomes `"&quot;"`
- `&` becomes `"&amp;"`
- `'` becomes `"&#x27;"`
- `<` becomes `"&lt;"`
- `>` becomes `"&gt;"`

This function is optimized for large input. It converts non-string values to a string before escaping them.

```ts
Bun.escapeHTML("<script>alert('Hello World!')</script>");
// &lt;script&gt;alert(&#x27;Hello World!&#x27;)&lt;/script&gt;
```

---

See [Utils](/runtime/utils).
