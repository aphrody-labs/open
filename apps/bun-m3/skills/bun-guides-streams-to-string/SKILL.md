---
name: bun-guides-streams-to-string
description: "Convert a ReadableStream to a string. Use when working with Bun: Convert a ReadableStream to a string (bun docs guides/streams/to-string.mdx)."
---

# Convert a ReadableStream to a string

Bun provides several conveniences for reading the contents of a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) into other formats. To read a stream into a string, call its `text()` method.

```ts
const stream = new ReadableStream();
const str = await stream.text();
```

`Bun.readableStreamToText(stream)` does the same thing, but is deprecated in favor of `stream.text()`.

---

See [Bun's other `ReadableStream` conversion functions](/runtime/utils#bun-readablestreamto).
