---
name: bun-reference-globals
description: "Bun API reference from bun-types globals.d.ts: 32 documented declarations with examples (new, new, LibEmptyOrNodeUtilTextEncoder, encodeInto, LibEmptyOrNodeUtilTextDecoder, ShadowRealm, ...)."
---

# globals

## `new`

Creates a new WebSocket instance with the given URL and options.

```ts
const ws = new WebSocket("wss://dev.local", {
 protocols: ["proto1", "proto2"],
 headers: {
   "Cookie": "session=123456",
 },
});
```

## `new`

Creates a new WebSocket instance with the given URL and protocols.

```ts
const ws = new WebSocket("wss://dev.local");
const ws = new WebSocket("wss://dev.local", ["proto1", "proto2"]);
```

## `LibEmptyOrNodeUtilTextEncoder`

An implementation of the [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/) `TextEncoder` API. All
instances of `TextEncoder` only support UTF-8 encoding.

```js
const encoder = new TextEncoder();
const uint8array = encoder.encode('this is some data');
```

## `encodeInto`

UTF-8 encodes the `src` string to the `dest` Uint8Array and returns an object
containing the read Unicode code units and written UTF-8 bytes.

```js
const encoder = new TextEncoder();
const src = 'this is some data';
const dest = new Uint8Array(10);
const { read, written } = encoder.encodeInto(src, dest);
```

## `LibEmptyOrNodeUtilTextDecoder`

An implementation of the [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/) `TextDecoder` API.
Supports every encoding label the standard defines, except the labels of the
`replacement` encoding.

```js
const decoder = new TextDecoder();
const text = decoder.decode(new Uint8Array([104, 105])); // "hi"
```

## `ShadowRealm`

A [ShadowRealm](https://github.com/tc39/proposal-shadowrealm/blob/main/explainer.md#introduction)
is a distinct global environment with its own global object containing its
own intrinsics and built-ins (standard objects that are not bound to global
variables, like the initial value of Object.prototype).

```js
const red = new ShadowRealm();

// Realms can import modules that execute within their own environment.
// When the module resolves, it captures the binding value, or creates a new
// wrapped function that is connected to the callable binding.
const redAdd = await red.importValue('./inside-code.js', 'add');

// redAdd is a wrapped function exotic object that chains its call to the
// respective imported binding.
let result = redAdd(2, 3);

console.assert(result === 5); // yields true

// The evaluate method runs code inside the ShadowRealm without loading a
// module, though it still requires CSP relaxing.
globalThis.someValue = 1;
red.evaluate('globalThis.someValue = 2'); // Affects only the ShadowRealm's global
console.assert(globalThis.someValue === 1);

// The wrapped functions can also wrap other functions the other way around.
const setUniqueValue =
await red.importValue('./inside-code.js', 'setUniqueValue');

// setUniqueValue = (cb) => (cb(globalThis.someValue) * 2);

result = setUniqueValue((x) => x ** 3);

console.assert(result === 16); // yields true
```

## `importValue`

Imports `bindingName` from the module at `specifier`, executed inside the
realm, and resolves with its value. Functions come back as wrapped
functions that chain their calls to the binding inside the realm.

```js
const red = new ShadowRealm();
const redAdd = await red.importValue('./inside-code.js', 'add');
console.assert(redAdd(2, 3) === 5);
```

## `dependencyKeysIfEvaluated`

Returns the dependencies of an already-evaluated module as module specifiers

The list is sorted and deduplicated.



For this code:


This would return:

```js
// /foo.js
import classNames from 'classnames';
import React from 'react';
import {createElement} from 'react';
```

```js
Loader.dependencyKeysIfEvaluated("/foo.js")
["bun:wrap", "/path/to/node_modules/classnames/index.js", "/path/to/node_modules/react/index.js"]
```

## `write`

Write a chunk directly to the destination.

Returns the number of bytes written, or a **pending `Promise<number>`**
when the destination's internal buffer is full (backpressure). The chunk
*was* accepted either way; `await`ing the result is enough:



The promise resolves once the destination has drained.
`await controller.flush(true)` is equivalent.

Returns `0` once the destination has gone away (for example, the HTTP
client disconnected).

```ts
await controller.write(chunk);
```

## `fromAsync`

Create an array from an iterable or async iterable object.
Values from the iterable are awaited.

```ts
await Array.fromAsync([1]); // [1]
await Array.fromAsync([Promise.resolve(1)]); // [1]
await Array.fromAsync((async function*() { yield 1 })()); // [1]
```

## `fromAsync`

Create an array from an iterable or async iterable object.
Values from the iterable are awaited. Results of the map function are also awaited.

```ts
await Array.fromAsync([1]); // [1]
await Array.fromAsync([Promise.resolve(1)]); // [1]
await Array.fromAsync((async function*() { yield 1 })()); // [1]
await Array.fromAsync([1], (n) => n + 1); // [2]
await Array.fromAsync([1], (n) => Promise.resolve(n + 1)); // [2]
```

## `AsyncIterableIterator`

Asynchronously read lines from standard input (fd 0)

```ts
for await (const line of console) {
  console.log(line);
}
```

## `write`

Write text or bytes to stdout

Unlike {@link console.log}, this does no formatting and doesn't add a
newline or spaces between arguments. You can pass it strings or bytes or
any combination of the two.

Not available in browsers.



When stdout cannot take the data right away (a pipe whose reader is slow),
the data is buffered and a Promise is returned instead of a number. Await it
to wait until the data has been written; it rejects if the write fails, for
example with `EPIPE` when the reader has closed the pipe.

```ts
console.write("hello world!", "\n"); // "hello world!\n"
```

```ts
await console.write(largeOutput);
```

## `table`

Try to construct a table with the columns of the properties of `tabularData` (or use `properties`) and rows of `tabularData` and log it. Falls back to
logging the argument if it can't be parsed as tabular.

```js
// These can't be parsed as tabular data
console.table(Symbol());
// Symbol()

console.table(undefined);
// undefined

console.table([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }]);
// ┌────┬─────┬─────┐
// │    │  a  │  b  │
// ├────┼─────┼─────┤
// │  0 │  1  │ 'Y' │
// │  1 │ 'Z' │  2  │
// └────┴─────┴─────┘

console.table([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }], ['a']);
// ┌────┬─────┐
// │    │  a  │
// ├────┼─────┤
// │ 0  │  1  │
// │ 1  │ 'Z' │
// └────┴─────┘
```

## `time`

Begin a timer to log with {@link console.timeEnd}

```ts
 console.time("how long????");
for (let i = 0; i < 999999; i++) {
   // do stuff
   let x = i * i;
}
console.timeEnd("how long????");
```

## `timeEnd`

End a timer to log with {@link console.time}

```ts
 console.time("how long????");
for (let i = 0; i < 999999; i++) {
 // do stuff
 let x = i * i;
}
console.timeEnd("how long????");
```

## `glob`

Import every module that matches a glob pattern. Compatible with
[Vite's `import.meta.glob`](https://vite.dev/guide/features#glob-import).

Bun's transpiler and bundler replace the call with an object literal, so
the arguments must be literals.

```ts
const pages = import.meta.glob("./pages/*.tsx");
// {
//   "./pages/about.tsx": () => import("./pages/about.tsx"),
//   "./pages/home.tsx": () => import("./pages/home.tsx"),
// }
```

## `glob`



```ts
const pages = import.meta.glob("./pages/*.tsx", { eager: true });
// import * as about from "./pages/about.tsx";
// import * as home from "./pages/home.tsx";
// { "./pages/about.tsx": about, "./pages/home.tsx": home }
```

## `url`

`file://` url string for the current module.

```ts
console.log(import.meta.url);
"file:///Users/me/projects/my-app/src/my-app.ts"
```

## `env`

The environment variables of the process



Under `bun test`, it's a view of `process.env` that also has Vite's `MODE`,
`DEV`, `PROD`, `SSR` and `BASE_URL`.

```ts
import.meta.env === process.env
```

## `main`

`true` if the current file started the process

```ts
if (import.meta.main) {
 console.log("I started the process!");
}
```

```ts
console.log(
  import.meta.main === (import.meta.path === Bun.main)
)
```

## `withResolvers`

Create a deferred promise with its `resolve` and `reject` functions exposed,
so code outside the promise can settle it.

```ts
const { promise, resolve, reject } = Promise.withResolvers();

setTimeout(() => {
 resolve("Hello world!");
}, 1000);

await promise; // "Hello world!"
```

## `image`

Wrap this blob in a {@link Bun.Image} pipeline. Equivalent to
`new Bun.Image(this, options)` — the constructor is synchronous (the
underlying read happens lazily when an Image terminal is awaited), so
this works on `Bun.file()`, `Bun.s3()`, fd-backed and in-memory blobs
alike:

```ts
await Bun.file("photo.jpg").image().resize(400).webp().write("thumb.webp");
```

## `json`

Create a new {@link Response} with a JSON body.

Syntactic sugar for:

```js
new Response(JSON.stringify(body), {headers: { "Content-Type": "application/json" }})
```

```ts
const response = Response.json({hi: "there"});
console.assert(
  await response.text(),
  `{"hi":"there"}`
);
```

## `proxy`

The proxy to send the request through, overriding the `http_proxy`,
`HTTPS_PROXY` and `ALL_PROXY` environment variables. Accepts a URL string,
a URL instance, or an object with `url` and optional `headers` and
`respectNoProxy`.

`false` connects directly, ignoring the proxy environment variables.

Hosts listed in `NO_PROXY` bypass the proxy unless `respectNoProxy` is
`false`.

If a `Proxy-Authorization` header is provided in `proxy.headers`, it takes
precedence over credentials parsed from the proxy URL.

Not part of the Fetch API specification.

```js
// String format
const response = await fetch("http://example.com", {
 proxy: "https://username:password@127.0.0.1:8080"
});

// Object format with custom headers sent to the proxy
const response = await fetch("http://example.com", {
 proxy: {
   url: "https://127.0.0.1:8080",
   headers: {
     "Proxy-Authorization": "Bearer token",
     "X-Custom-Proxy-Header": "value"
   }
 }
});

// Never use a proxy for this request
const direct = await fetch("http://example.com", { proxy: false });
```

## `s3`

Override the default S3 options

```js
const response = await fetch("s3://bucket/key", {
  s3: {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    region: "us-east-1",
  }
});
```

## `unix`

Make the request over a Unix socket

```js
const response = await fetch("http://example.com", { unix: "/path/to/socket" });
```

## `decompress`

Control automatic decompression of the response body. When `false`, the
body is not decompressed and the `Content-Encoding` header is preserved.
This can improve performance when you handle compressed data yourself or
forward it as-is.
Not part of the Fetch API specification.

```js
// Disable automatic decompression for a proxy server
const response = await fetch("https://example.com/api", {
  decompress: false
});
// response.headers.get('content-encoding') might be 'gzip' or 'br'
```

## `compress`

Automatically compress the request body before sending and set the
`Content-Encoding` request header accordingly.

- `true` is equivalent to `"gzip"`.
- A string selects the encoding with its default level.
- An object selects the encoding and an explicit compression `level`.

Only buffered bodies (string, `ArrayBuffer`/`TypedArray`, `Blob`) are
compressed; `ReadableStream` bodies are sent as-is. If the request
already has a `Content-Encoding` header, the body is left unchanged.
Not part of the Fetch API specification.

```js
await fetch("https://example.com/upload", {
  method: "POST",
  body: JSON.stringify(bigPayload),
  compress: "gzip",
});
```

## `maxRedirects`

The maximum number of redirects to follow when `redirect` is `"follow"`.
If the response chain redirects more than this many times, the request
rejects with a "too many redirects" error.
Not part of the Fetch API specification.

```js
const response = await fetch("https://example.com/", { maxRedirects: 3 });
```

## `timeout`

Control the socket idle timeout for this request. The timer is reset on
every byte sent or received; if the connection stays idle for longer than
this, the request fails with a timeout error.

- A finite positive number sets the idle deadline in milliseconds,
  overriding the `BUN_CONFIG_HTTP_IDLE_TIMEOUT` default (5 minutes).
- `0`, `false`, or a non-finite number disables the idle timer for this
  request.
- `true` or an omitted value uses the default.

This is not a whole-request deadline; use `AbortSignal.timeout(ms)` for
that. Not part of the Fetch API specification.

```js
// Allow a slow streaming response to stay idle for up to an hour
const response = await fetch("https://example.com/llm", {
  timeout: 60 * 60 * 1000,
});
```

## `escape`

Escapes any potential regex syntax characters in a string, and returns a
new string that can be safely used as a literal pattern for the RegExp()
constructor.

[MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape)

```ts
const re = new RegExp(RegExp.escape("foo.bar"));
re.test("foo.bar"); // true
re.test("foo!bar"); // false
```

