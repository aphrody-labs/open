---
name: bun-guides-streams-node-readable-to-blob
description: "Convert a Node.js Readable to a Blob. Use when working with Bun: Convert a Node.js Readable to a Blob (bun docs guides/streams/node-readable-to-blob.mdx)."
---

# Convert a Node.js Readable to a Blob

To convert a Node.js `Readable` stream to a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) in Bun, create a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) with the stream as the body, then call [`response.blob()`](https://developer.mozilla.org/en-US/docs/Web/API/Response/blob).

```ts
const stream = Readable.from(["Hello, ", "world!"]);
const blob = await new Response(stream).blob();
```
