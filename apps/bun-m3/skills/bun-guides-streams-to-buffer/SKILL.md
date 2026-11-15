---
name: bun-guides-streams-to-buffer
description: "Convert a ReadableStream to a Buffer. Use when working with Bun: Convert a ReadableStream to a Buffer (bun docs guides/streams/to-buffer.mdx)."
---

# Convert a ReadableStream to a Buffer

To convert a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) to a `Buffer`, read its contents into an [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) with `Bun.readableStreamToArrayBuffer`, then create a [`Buffer`](https://nodejs.org/api/buffer.html) that points to it.

```ts
const stream = new ReadableStream();
const arrBuf = await Bun.readableStreamToArrayBuffer(stream);
const nodeBuf = Buffer.from(arrBuf);
```

---

See [Bun's other `ReadableStream` conversion functions](/runtime/utils#bun-readablestreamto).
