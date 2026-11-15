---
name: bun-runtime-node-api
description: "Use Bun's Node-API module to build native add-ons to Node.js. Use when working with Bun: Node-API (bun docs runtime/node-api.mdx)."
---

# Node-API

Node-API is an interface for building native add-ons to Node.js. Bun implements this interface from scratch, so most existing Node-API extensions work with Bun out of the box.

As in Node.js, you can `require()` `.node` files (Node-API modules) directly.

```js
const napi = require("./my-node-module.node");
```

Alternatively, use `process.dlopen`:

```js
let mod = { exports: {} };
process.dlopen(mod, "./my-node-module.node");
```
