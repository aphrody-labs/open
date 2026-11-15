---
name: bun-guides-streams-node-readable-to-json
description: "Convert a Node.js Readable to JSON. Use when working with Bun: Convert a Node.js Readable to JSON (bun docs guides/streams/node-readable-to-json.mdx)."
---

# Convert a Node.js Readable to JSON

To convert a Node.js `Readable` stream to a JSON object in Bun, create a [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) with the stream as the body, then call [`response.json()`](https://developer.mozilla.org/en-US/docs/Web/API/Response/json).

```ts
const stream = Readable.from([JSON.stringify({ hello: "world" })]);
const json = await new Response(stream).json();
console.log(json); // { hello: "world" }
```
