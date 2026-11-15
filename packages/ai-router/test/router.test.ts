// Runs against the built library (AI_ROUTER_LIB or the workspace target/); skipped when it is not built here.
import { expect, test } from "bun:test";
import { load, Router } from "../src/index.ts";

const built = load() !== null;

test.skipIf(!built)("routes to a local OpenAI-compatible server first and reports the attempt", async () => {
  const server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname.endsWith("/models")) return Response.json({ data: [{ id: "tiny" }] });
      return Response.json({ object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content: "pong" }, finish_reason: "stop" }] });
    },
  });
  // the router calls back into this process from a native thread: give Bun's event loop the time to serve it
  const config = { catalog: {}, local: [`http://127.0.0.1:${server.port}/v1`] };
  const answer = await new Promise<Record<string, any>>((resolve) => {
    const worker = new Worker(new URL("./chat-worker.ts", import.meta.url).href);
    worker.onmessage = (e) => (resolve(e.data), worker.terminate());
    worker.postMessage(config);
  });
  server.stop(true);
  expect(answer.choices[0].message.content).toBe("pong");
  expect(answer.router.local).toBe(true);
  expect(answer.router.attempts.length).toBe(1);
});

test.skipIf(!built)("an empty catalog and no local server give a clear error, not a crash", () => {
  using r = new Router({ catalog: {}, local: [] });
  expect(r.models()).toEqual([]);
  expect(r.chat({ messages: [{ role: "user", content: "hi" }] }).error.type).toBe("router_exhausted");
});
