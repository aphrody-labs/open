// Runs against the built library: AI_ROUTER_LIB, else the workspace target/ (built here with cargo when absent).
import { beforeAll, expect, test } from "bun:test";
import { join } from "node:path";
import { load, Router } from "../src/index.ts";

beforeAll(() => {
  if (load() !== null) return;
  const built = Bun.spawnSync(["cargo", "build", "-p", "ai-router"], { cwd: join(import.meta.dir, "..", "..", ".."), stdout: "inherit", stderr: "inherit" });
  if (built.exitCode !== 0 || load() === null) throw new Error("ai-router library not built: set AI_ROUTER_LIB or run cargo build -p ai-router");
}, 900_000);

test("routes to a local OpenAI-compatible server first and reports the attempt", async () => {
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

test("an empty catalog and no local server give a clear error, not a crash", () => {
  using r = new Router({ catalog: {}, local: [] });
  expect(r.models()).toEqual([]);
  expect(r.chat({ messages: [{ role: "user", content: "hi" }] }).error.type).toBe("router_exhausted");
});

test("streams chunks through the C ABI callback", async () => {
  const server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch(req) {
      if (new URL(req.url).pathname.endsWith("/models")) return Response.json({ data: [{ id: "tiny" }] });
      const sse = ["po", "ng"].map((t) => `data: ${JSON.stringify({ object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: t } }] })}\n\n`).join("") + "data: [DONE]\n\n";
      return new Response(sse, { headers: { "content-type": "text/event-stream" } });
    },
  });
  const out = await new Promise<{ text: string; summary: Record<string, any> }>((resolve) => {
    const worker = new Worker(new URL("./stream-worker.ts", import.meta.url).href);
    worker.onmessage = (e) => (resolve(e.data), worker.terminate());
    worker.postMessage({ catalog: {}, local: [`http://127.0.0.1:${server.port}/v1`] });
  });
  server.stop(true);
  expect(out.text).toBe("pong");
  expect(out.summary.router.local).toBe(true);
});
