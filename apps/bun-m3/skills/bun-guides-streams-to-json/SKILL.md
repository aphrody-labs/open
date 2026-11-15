---
name: bun-guides-streams-to-json
description: "Convert a ReadableStream to JSON. Use when working with Bun: Convert a ReadableStream to JSON (bun docs guides/streams/to-json.mdx)."
---

# Convert a ReadableStream to JSON

Bun provides several conveniences for reading the contents of a [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) into other formats. To read a stream and parse it as JSON, call its `json()` method.

```ts
const stream = new ReadableStream();
const json = await stream.json();
```

---

See [Bun's other `ReadableStream` conversion functions](/runtime/utils#bun-readablestreamto).
