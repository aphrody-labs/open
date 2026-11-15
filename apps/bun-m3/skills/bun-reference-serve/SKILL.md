---
name: bun-reference-serve
description: "Bun API reference from bun-types serve.d.ts: 36 documented declarations with examples (ServerWebSocketSendStatus, ServerWebSocket, send, sendText, sendBinary, publish, ...)."
---

# serve

## `ServerWebSocketSendStatus`

A status that represents the outcome of a sent message.

- if **0**, the message was **dropped**.
- if **-1**, there is **backpressure** of messages.
- if **>0**, it represents the **number of bytes sent**.

Sending an empty payload (`ws.send("")`, `ws.ping()`, `ws.pong()`) succeeds but also returns **0**.

```js
const status = ws.send("Hello!");
if (status === 0) {
  console.log("Message was dropped");
} else if (status === -1) {
  console.log("Backpressure was applied");
} else {
  console.log(`Success! Sent ${status} bytes`);
}
```

## `ServerWebSocket`

A fast WebSocket designed for servers.

Features:
- **Message compression** - Messages can be compressed
- **Backpressure** - `send()` reports when the client is not ready to receive data.
- **Dropped messages** - `send()` reports when the client cannot receive data.
- **Topics** - Messages can be {@link ServerWebSocket.publish}ed to a specific topic and the client can {@link ServerWebSocket.subscribe} to topics

This differs slightly from the browser {@link WebSocket}, which Bun supports for clients.

Powered by [uWebSockets](https://github.com/uNetworking/uWebSockets).

```ts
Bun.serve({
  websocket: {
    open(ws) {
      console.log("Connected", ws.remoteAddress);
    },
    message(ws, data) {
      console.log("Received", data);
      ws.send(data);
    },
    close(ws, code, reason) {
      console.log("Disconnected", code, reason);
    },
  }
});
```

## `send`

Sends a message to the client.

```ts
ws.send("Hello!");
ws.send("Compress this.", true);
ws.send(new Uint8Array([1, 2, 3, 4]));
```

## `sendText`

Sends a text message to the client.

```ts
ws.sendText("Hello!");
ws.sendText("Compress this.", true);
```

## `sendBinary`

Sends a binary message to the client.

```ts
ws.sendBinary(new TextEncoder().encode("Hello!"));
ws.sendBinary(new Uint8Array([1, 2, 3, 4]), true);
```

## `publish`

Sends a message to subscribers of the topic.

```ts
ws.publish("chat", "Hello!");
ws.publish("chat", "Compress this.", true);
ws.publish("chat", new Uint8Array([1, 2, 3, 4]));
```

## `publishText`

Sends a text message to subscribers of the topic.

```ts
ws.publishText("chat", "Hello!");
ws.publishText("chat", "Compress this.", true);
```

## `publishBinary`

Sends a binary message to subscribers of the topic.

```ts
ws.publishBinary("chat", new TextEncoder().encode("Hello!"));
ws.publishBinary("chat", new Uint8Array([1, 2, 3, 4]), true);
```

## `subscribe`

Subscribes a client to the topic.

```ts
ws.subscribe("chat");
```

## `unsubscribe`

Unsubscribes a client from the topic.



`false` if the socket is closed or the client was not subscribed to the topic.

```ts
ws.unsubscribe("chat");
```

## `isSubscribed`

Returns whether the client is subscribed to the topic.

```ts
ws.subscribe("chat");
console.log(ws.isSubscribed("chat")); // true
```

## `subscriptions`

Returns an array of all topics the client is currently subscribed to.

```ts
ws.subscribe("chat");
ws.subscribe("notifications");
console.log(ws.subscriptions); // ["chat", "notifications"]
```

## `cork`

Batches `send()` and `publish()` operations, which makes it faster to send data.

The `message`, `open`, and `drain` callbacks are automatically corked, so
you only need to call this if you are sending messages outside of those
callbacks or in async functions.

```ts
ws.cork((ctx) => {
  ctx.send("These messages");
  ctx.sendText("are sent");
  ctx.sendBinary(new TextEncoder().encode("together!"));
});
```

## `remoteAddress`

The IP address of the client.

```ts
console.log(socket.remoteAddress); // "127.0.0.1"
```

## `readyState`

The ready state of the client.

- if `1`, the client is connected.
- if `3`, the client is closed, or `close()` or `terminate()` was called.

A `ServerWebSocket` is never `0` (connecting) or `2` (closing).

```ts
console.log(socket.readyState); // 1
```

## `binaryType`

Sets how binary data is returned in events.

- if `nodebuffer`, binary data is returned as `Buffer` objects. **(default)**
- if `arraybuffer`, binary data is returned as `ArrayBuffer` objects.
- if `uint8array`, binary data is returned as `Uint8Array` objects.
- if `blob`, binary data is returned as `Blob` objects.

This applies to binary messages and to the payloads of pings and pongs.

```ts
Bun.serve({
  websocket: {
    open(ws) {
      ws.binaryType = "uint8array";
    },
    message(ws, message) {
      console.log(message instanceof Uint8Array); // true, for a binary message
    },
  },
  // ...
});
```

## `data`

Custom data you can assign to a client. It can be read and written at any time.

```ts
import { serve } from "bun";

serve({
  fetch(request, server) {
    const data = {
      accessToken: request.headers.get("Authorization"),
    };
    if (server.upgrade(request, { data })) {
      return;
    }
    return new Response();
  },
  websocket: {
    data: {} as {accessToken: string | null},
    message(ws) {
      console.log(ws.data.accessToken);
    }
  }
});
```

## `pause`

Stops reading from the socket, so the client sees TCP backpressure. The
idle timeout is suspended until `resume()`. Sending still works.

Messages already read from the socket are still delivered.

```ts
message(ws, message) {
  if (!file.write(message)) {
    ws.pause();
    file.once("drain", () => ws.resume());
  }
}
```

## `WebSocketHandler`

Server-side {@link ServerWebSocket} event handlers for {@link Bun.serve}

```ts
import { serve } from "bun";

serve({
  port: 3000,
  websocket: {
    data: {} as { name: string | null },
    open: (ws) => {
      console.log("Client connected");
   },
    message: (ws, message) => {
      console.log(`${ws.data.name}: ${message}`);
   },
    close: (ws) => {
      console.log("Client disconnected");
   },
 },

  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      const upgraded = server.upgrade(req, {
        data: {
          name: new URL(req.url).searchParams.get("name"),
       },
     });
      if (!upgraded) {
        return new Response("Upgrade failed", { status: 400 });
     }
     return;
   }
    return new Response("Hello World");
 },
});
```

## `data`

Specify the type for the {@link ServerWebSocket.data} property on
connecting websocket clients. You can pass this value when you call
{@link Server.upgrade}.

This pattern exists in Bun due to a [TypeScript limitation (#26242)](https://github.com/microsoft/TypeScript/issues/26242)

```ts
Bun.serve({
  websocket: {
    data: {} as { name: string }, // ← Specify the type of `ws.data` like this
    message: (ws, message) => console.log(ws.data.name, 'says:', message);
  },
  // ...
});
```

## `chromeDevToolsAutomaticWorkspaceFolders`

Enable automatic workspace folders for Chrome DevTools

With this enabled, you can persistently edit files in the browser. Bun adds the following route to the server:
`/.well-known/appspecific/com.chrome.devtools.json`

The response is a JSON object with the following shape:


The `root` field is the current working directory of the server.
The `uuid` field is a hash of the file that started the server and a hash of the current working directory.

For security, requests from a remote address other than localhost, 127.0.0.1, or ::1 are ignored.

```json
{
  "workspace": {
    "root": "<cwd>",
    "uuid": "<uuid>"
  }
}
```

## `DirectoryRouteOptions`

Serve a directory tree at a URL prefix.

The route path **must** end in `/*`. The part of the request URL after
the prefix is percent-decoded once and opened relative to `dir`.
Non-canonical paths (containing `.`, `..`, empty segments, `%2F`, or a
`%XX` sequence encoding a character that may appear literally in a path
segment) are rejected with `404` so the served path is always the path
the router matched. A symlink never leads out of `dir`: symlinks resolve
as if `dir` were the root directory, so a `..` stops at `dir` and an
absolute target starts from it. Windows follows symlinks wherever they
lead. Routing is case-sensitive but filesystems on macOS and Windows are
not by default: do not place access-controlled content inside `dir` and
rely on an overlapping route to gate it.

Responses carry `Content-Type` (from the file extension),
`Last-Modified`, a weak `ETag`, and support single-range `Range`
requests. A request that resolves to a directory without a trailing
`/` is redirected (`301`) to the trailing-slash URL; with the trailing
slash, `index.html` from that directory is served. Missing files
return `404`.

```ts
Bun.serve({
  routes: {
    "/static/*": { dir: "./public" },
  },
});
```

## `websocket`

Enable websockets with {@link Bun.serve}

Upgrade a {@link Request} to a {@link ServerWebSocket} with {@link Server.upgrade}

Pass `data` in {@link Server.upgrade} to attach data to the {@link ServerWebSocket.data} property

```js
const server: Bun.Server = Bun.serve({
 websocket: {
   open: (ws) => {
     console.log("Client connected");
   },
   message: (ws, message) => {
     console.log("Client sent message", message);
   },
   close: (ws) => {
     console.log("Client disconnected");
   },
 },
 fetch(req, server) {
   const url = new URL(req.url);
   if (url.pathname === "/chat") {
     const upgraded = server.upgrade(req);
     if (!upgraded) {
       return new Response("Upgrade failed", { status: 400 });
     }
   }
   return new Response("Hello World");
 },
});
```

## `tls`

Set options for using TLS with this server

```ts
const server = Bun.serve({
  fetch: request => new Response("Welcome to Bun!"),
  tls: {
    cert: Bun.file("cert.pem"),
    key: Bun.file("key.pem"),
    ca: [Bun.file("ca1.pem"), Bun.file("ca2.pem")],
  },
});
```

## `error`

Called when an error is thrown during request handling

```ts
error: (error) => {
  return new Response("Internal Server Error", { status: 500 });
}
```

## `hostname`

The hostname the server listens on




 

`

The hostname should not include a {@link port}

```js
"0.0.0.0" // listen on all interfaces
```

```js
"127.0.0.1" // Only listen locally
```

```js
"remix.run" // Only listen on remix.run
```

## `Options`

Options for {@link serve}, with support for `routes` and a safer
requirement for `fetch`

```ts
export default {
  fetch: req => Response.json(req.url),

  websocket: {
    message(ws) {
      ws.data.name; // string
    },
  },
} satisfies Bun.Serve.Options<{ name: string }>;
```

## `reload`

Update the `fetch` and `error` handlers without restarting the server.





Passing other options such as `port` or `hostname` has no effect.

```js
// create the server
const server = Bun.serve({
 fetch(request) {
   return new Response("Hello World v1")
 }
});

// Update the server to return a different response
server.reload({
  fetch(request) {
    return new Response("Hello World v2")
  }
});
```

## `upgrade`

Upgrade a {@link Request} to a {@link ServerWebSocket}









What you pass to `data` is available on the {@link ServerWebSocket.data} property

```js
import { serve } from "bun";
const server: Bun.Server<{ user: string }> = serve({
  websocket: {
    open: (ws) => {
      console.log("Client connected");
    },
    message: (ws, message) => {
      console.log("Client sent message", message);
    },
    close: (ws) => {
      console.log("Client disconnected");
    },
  },
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/chat") {
      const upgraded = server.upgrade(req, {
        data: {user: "John Doe"}
      });
      if (!upgraded) {
        return new Response("Upgrade failed", { status: 400 });
      }
    }
    return new Response("Hello World");
  },
});
```

## `data`

Data to store on the WebSocket instance

---

**Surprised this line is erroring?**

Tell TypeScript about the WebSocket data by using `Bun.Server<MyWebSocketData>`

```ts
const server: Bun.Server<MyWebSocketData> = Bun.serve({
     fetch: (req, server) => {
         const didUpgrade = server.upgrade(req, {
             data: { ... }, // Works now!
         });
     },
});
```

## `publish`

Send a message to all connected {@link ServerWebSocket} clients subscribed to a topic




{@link ServerWebSocket.publish}, which default to `false`. Ignored for subscribers that don't support compression.

```js
server.publish("chat", "Hello World");
```

```js
server.publish("chat", new Uint8Array([1, 2, 3, 4]));
```

```js
// uncompressed for every subscriber
server.publish("chat", new ArrayBuffer(4), false);
```

```js
server.publish("chat", new DataView(new ArrayBuffer(4)));
```

## `requestIP`

Returns the client IP address and port of the given Request. If the request was closed or is a unix socket, returns null.

```js
export default {
 async fetch(request, server) {
   return new Response(server.requestIP(request));
 }
}
```

## `timeout`

Reset the idle timeout of the given Request to the given number of seconds. `0` means no timeout.

```js
export default {
 async fetch(request, server) {
   server.timeout(request, 60);
   await Bun.sleep(30000);
   return new Response("30 seconds have passed");
 }
}
```

## `port`

The port the server is listening on.

This is `undefined` when the server is listening on a unix socket.

```js
3000
```

## `hostname`

The hostname the server is listening on. Does not include the port.

This is `undefined` when the server is listening on a unix socket.

```js
"localhost"
```

## `serve`

Bun.serve starts a high-performance HTTP server with built-in routing.
Routes can be static responses, handler functions, or per-method handler
objects, with type-safe path parameters.




**Basic Usage**




**Route-based Handlers**




**Path Parameters**




**Route Precedence**




**Error Handling**




**Server Lifecycle**




**Development Mode**




**Type-Safe Request Handling**

```ts
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello World");
  }
});
```

```ts
Bun.serve({
  routes: {
    // Static responses
    "/": new Response("Home page"),

    // Function handlers with type-safe parameters
    "/users/:id": (req) => {
      // req.params.id is typed as string
      return new Response(`User ${req.params.id}`);
    },

    // Method-specific handlers
    "/api/posts": {
      GET: () => new Response("Get posts"),
      POST: async (req) => {
        const body = await req.json();
        return new Response("Created post");
      },
      DELETE: (req) => new Response("Deleted post")
    },

    // Wildcard routes
    "/static/*": (req) => {
      // Handle any path under /static/
      return new Response("Static file");
    },

    // Disable route (fall through to fetch handler)
    "/api/legacy": false
  },

  // Fallback handler for unmatched routes
  fetch(req) {
    return new Response("Not Found", { status: 404 });
  }
});
```

```ts
Bun.serve({
  routes: {
    // Single parameter
    "/users/:id": (req: BunRequest<"/users/:id">) => {
      return new Response(`User ID: ${req.params.id}`);
    },

    // Multiple parameters
    "/posts/:postId/comments/:commentId": (
      req: BunRequest<"/posts/:postId/comments/:commentId">
    ) => {
      return new Response(JSON.stringify(req.params));
      // Output: {"postId": "123", "commentId": "456"}
    }
  }
});
```

```ts
// Routes are matched in the following order:
// 1. Exact static routes ("/about")
// 2. Parameter routes ("/users/:id")
// 3. Wildcard routes ("/api/*")

Bun.serve({
  routes: {
    "/api/users": () => new Response("Users list"),
    "/api/users/:id": (req) => new Response(`User ${req.params.id}`),
    "/api/*": () => new Response("API catchall"),
    "/*": () => new Response("Root catchall")
  }
});
```

```ts
Bun.serve({
  routes: {
    "/error": () => {
      throw new Error("Something went wrong");
    }
  },
  error(error) {
    // Custom error handler
    console.error(error);
    return new Response(`Error: ${error.message}`, {
      status: 500
    });
  }
});
```

```ts
const server = Bun.serve({
  // Server config...
});

// Update routes at runtime
server.reload({
  routes: {
    "/": () => new Response("Updated route")
  }
});

// Stop the server
server.stop();
```

```ts
Bun.serve({
  development: true, // Enable hot reloading
  routes: {
    // Routes will auto-reload on changes
  }
});
```

```ts
type Post = {
  id: string;
  title: string;
};

Bun.serve({
 routes: {
    "/api/posts/:id": async (
      req: BunRequest<"/api/posts/:id">
    ) => {
      if (req.method === "POST") {
        const body: Post = await req.json();
        return Response.json(body);
      }
      return new Response("Method not allowed", {
        status: 405
      });
    }
  }
});
```

