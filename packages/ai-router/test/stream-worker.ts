// Streaming through the C ABI from a worker, so the test's server stays responsive.
import { Router } from "../src/index.ts";

declare const self: Worker;
self.onmessage = (e: MessageEvent) => {
  using r = new Router(e.data);
  let text = "";
  const summary = r.chatStream({ model: "auto:local", messages: [{ role: "user", content: "ping" }] }, (c) => (text += c.choices?.[0]?.delta?.content ?? ""));
  self.postMessage({ text, summary });
};
