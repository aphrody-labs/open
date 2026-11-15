---
name: bun-reference-shell
description: "Bun API reference from bun-types shell.d.ts: 20 documented declarations with examples ($, braces, env, Promise, env, text, ...)."
---

# shell

## `$`

Runs a shell command with the [Bun Shell](https://bun.com/docs/runtime/shell).

```ts
const result = await $`echo "Hello, world!"`.text();
console.log(result); // "Hello, world!"
```

## `braces`

Perform bash-like brace expansion on the given pattern.

```js
const result = braces('index.{js,jsx,ts,tsx}');
console.log(result) // ['index.js', 'index.jsx', 'index.ts', 'index.tsx']
```

## `env`

Change the default environment variables for shells created by this instance.

```js
import {$} from 'bun';
$.env({ BUN: "bun" });
await $`echo $BUN`;
// "bun"
```

## `Promise`

A shell command that runs once awaited, or once an output method like
`.text()` or `.json()` is called.

```ts
const myShellPromise = $`echo "Hello, world!"`;
const result = await myShellPromise.text();
console.log(result); // "Hello, world!"
```

## `env`

Set environment variables for the shell.

```ts
const { stdout } = await $`echo $FOO`.env({ ...process.env, FOO: "bun" });
console.log(stdout.toString()); // "bun\n"
```

## `text`

Read from stdout as a string.

Automatically calls {@link quiet} to disable echoing to stdout.





**Read as UTF-8 string**


**Read as base64 string**

```ts
const output = await $`echo hello`.text();
console.log(output); // "hello\n"
```

```ts
const output = await $`echo ${atob("hello")}`.text("base64");
console.log(output); // "hello\n"
```

## `json`

Read from stdout as a JSON object

Automatically calls {@link quiet}

```ts
const output = await $`echo '{"hello": 123}'`.json();
console.log(output); // { hello: 123 }
```

## `arrayBuffer`

Read from stdout as an ArrayBuffer

Automatically calls {@link quiet}

```ts
const output = await $`echo hello`.arrayBuffer();
console.log(output); // ArrayBuffer { byteLength: 6 }
```

## `blob`

Read from stdout as a Blob

Automatically calls {@link quiet}

```ts
const output = await $`echo hello`.blob();
console.log(output); // Blob { size: 6, type: "" }
```

## `ShellOutput`

An error that occurred while executing a shell command with [the Bun Shell](https://bun.com/docs/runtime/shell).

```ts
try {
  const result = await $`exit 1`;
} catch (error) {
  if (error instanceof $.ShellError) {
    console.log(error.exitCode); // 1
  }
}
```

## `text`

Read from stdout as a string





**Read as UTF-8 string**


**Read as base64 string**

```ts
const output = await $`echo hello`;
console.log(output.text()); // "hello\n"
```

```ts
const output = await $`echo ${atob("hello")}`;
console.log(output.text("base64")); // "hello\n"
```

## `json`

Read from stdout as a JSON object

```ts
const output = await $`echo '{"hello": 123}'`;
console.log(output.json()); // { hello: 123 }
```

## `arrayBuffer`

Read from stdout as an ArrayBuffer

```ts
const output = await $`echo hello`;
console.log(output.arrayBuffer()); // ArrayBuffer { byteLength: 6 }
```

## `blob`

Read from stdout as a Blob

```ts
const output = await $`echo hello`;
console.log(output.blob()); // Blob { size: 6, type: "" }
```

## `bytes`

Read from stdout as a Uint8Array

```ts
const output = await $`echo hello`;
console.log(output.bytes()); // Uint8Array { byteLength: 6 }
```

## `text`

Read from stdout as a string





**Read as UTF-8 string**


**Read as base64 string**

```ts
const output = await $`echo hello`;
console.log(output.text()); // "hello\n"
```

```ts
const output = await $`echo ${atob("hello")}`;
console.log(output.text("base64")); // "hello\n"
```

## `json`

Read from stdout as a JSON object

```ts
const output = await $`echo '{"hello": 123}'`;
console.log(output.json()); // { hello: 123 }
```

## `arrayBuffer`

Read from stdout as an ArrayBuffer

```ts
const output = await $`echo hello`;
console.log(output.arrayBuffer()); // ArrayBuffer { byteLength: 6 }
```

## `bytes`

Read from stdout as a Uint8Array

```ts
const output = await $`echo hello`;
console.log(output.bytes()); // Uint8Array { byteLength: 6 }
```

## `blob`

Read from stdout as a Blob

```ts
const output = await $`echo hello`;
console.log(output.blob()); // Blob { size: 6, type: "" }
```

