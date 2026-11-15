---
name: bun-guides-streams-node-readable-to-uint8array
description: "Convert a Node.js Readable to an Uint8Array. Use when working with Bun: Convert a Node.js Readable to an Uint8Array (bun docs guides/streams/node-readable-to-uint8array.mdx)."
---

# Convert a Node.js Readable to an Uint8Array

To convert a Node.js `Readable` stream to a `Uint8Array` in Bun, create a `Response` with the stream as the body, then call `bytes()`.

```ts
const stream = Readable.from(["Hello, ", "world!"]);
const buf = await new Response(stream).bytes();
```
