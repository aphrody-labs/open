// The FFI call blocks its thread; running it in a worker keeps the test's HTTP server responsive.
import { Router } from "../src/index.ts";

declare const self: Worker;
self.onmessage = (e: MessageEvent) => {
  using r = new Router(e.data);
  self.postMessage(r.chat({ model: "auto:local", messages: [{ role: "user", content: "ping" }] }));
};
