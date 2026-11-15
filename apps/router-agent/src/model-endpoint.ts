// The agent's model: an OpenAI-compatible endpoint on loopback in front of ai-router (through its C ABI), so the
// agent loop talks to every offer the router can reach, local first.
import type { RouterConfig } from "../../../packages/ai-router/src/index.ts";

export function serveModel(config: RouterConfig) {
  return Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    idleTimeout: 255,
    routes: {
      "/v1/chat/completions": {
        POST: async (req, srv) => {
          srv.timeout(req, 0);
          const request = (await req.json()) as Record<string, unknown>;
          const worker = new Worker(new URL("./chat-worker.ts", import.meta.url).href);
          const stream = new ReadableStream({
            start(c) {
              worker.onmessage = (e: MessageEvent<{ chunk?: unknown; summary?: { error?: unknown } }>) => {
                if (e.data.chunk) c.enqueue(`data: ${JSON.stringify(e.data.chunk)}\n\n`);
                if (e.data.summary) {
                  if (e.data.summary.error) c.enqueue(`data: ${JSON.stringify(e.data.summary)}\n\n`);
                  c.enqueue("data: [DONE]\n\n");
                  c.close();
                  worker.terminate();
                }
              };
              worker.postMessage({ config, request: { ...request, stream: true } });
            },
            cancel: () => worker.terminate(),
          });
          return new Response(stream, { headers: { "content-type": "text/event-stream" } });
        },
      },
    },
  });
}
