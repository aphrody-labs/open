---
name: bun-guides-streams-to-arraybuffer
description: "Convert a ReadableStream to an ArrayBuffer. Use when working with Bun: Convert a ReadableStream to an ArrayBuffer (bun docs guides/streams/to-arraybuffer.mdx)."
---

# Convert a ReadableStream to an ArrayBuffer

`Bun.readableStreamToArrayBuffer` reads the contents of a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) into an `ArrayBuffer`.

```ts
const stream = new ReadableStream();
const buf = await Bun.readableStreamToArrayBuffer(stream);
```

---

See [Bun's other `ReadableStream` conversion functions](/runtime/utils#bun-readablestreamto).
