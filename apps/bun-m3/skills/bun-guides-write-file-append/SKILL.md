---
name: bun-guides-write-file-append
description: "Append content to a file. Use when working with Bun: Append content to a file (bun docs guides/write-file/append.mdx)."
---

# Append content to a file

Bun implements the `node:fs` module, which includes the `fs.appendFile` and `fs.appendFileSync` functions for appending content to files.

---

`fs.appendFile` asynchronously appends data to a file, creating the file if it does not yet exist. The content can be a string or a `Buffer`.

```ts

await appendFile("message.txt", "data to append");
```

---

To use the non-`Promise` API:

```ts

appendFile("message.txt", "data to append", err => {
  if (err) throw err;
  console.log('The "data to append" was appended to file!');
});
```

---

To specify the encoding of the content:

```js

appendFile("message.txt", "data to append", "utf8", callback);
```

---

To append the data synchronously, use `fs.appendFileSync`:

```ts

appendFileSync("message.txt", "data to append", "utf8");
```

---

See the [Node.js documentation](https://nodejs.org/api/fs.html#fspromisesappendfilepath-data-options) for `fs.appendFile`.
