---
name: bun-guides-read-file-stream
description: "Read a file as a ReadableStream. Use when working with Bun: Read a file as a ReadableStream (bun docs guides/read-file/stream.mdx)."
---

# Read a file as a ReadableStream

The `Bun.file()` function accepts a path and returns a `BunFile` instance. `BunFile` extends `Blob`, so you can read the file lazily in a variety of formats. Use `.stream()` to consume the file incrementally as a `ReadableStream`.

```ts
const path = "/path/to/package.json";
const file = Bun.file(path);

const stream = file.stream();
```

---

The stream is an [async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols), so you can read its chunks with `for await`.

```ts
for await (const chunk of stream) {
  chunk; // => Uint8Array
}
```

---

See [Streams](/runtime/streams) for more on working with streams in Bun.
