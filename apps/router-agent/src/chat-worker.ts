// One request per worker: the router's FFI call blocks its thread.
import { Router, type RouterConfig } from "../../../packages/ai-router/src/index.ts";

declare const self: Worker;
self.onmessage = (e: MessageEvent<{ config: RouterConfig; request: Record<string, unknown> }>) => {
  try {
    using r = new Router(e.data.config);
    const summary = r.chatStream(e.data.request as never, (chunk) => self.postMessage({ chunk }));
    self.postMessage({ summary });
  } catch (err) {
    self.postMessage({ summary: { error: { message: String(err) } } });
  }
};
