---
name: bun-reference-html-rewriter
description: "Bun API reference from bun-types html-rewriter.d.ts: 1 documented declarations with examples (HTMLRewriter)."
---

# html-rewriter

## `HTMLRewriter`

[HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter?bun) is a fast API for transforming HTML.

Bun's implementation is native, built on [lol-html](https://github.com/cloudflare/lol-html).

Use it to rewrite URLs, add meta tags, remove elements, or add elements to the head.

```ts
const rewriter = new HTMLRewriter().on('a[href]', {
  element(element: Element) {
    // Rewrite all the URLs to this youtube video
    element.setAttribute('href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  }
});
rewriter.transform(await fetch("https://remix.run"));
```

