// Chat app over ai-router: the Angular Material client (HTML import) and two endpoints. POST /api/chat streams the
// answer as server-sent events from a worker that calls the router through its C ABI; GET /api/models lists the
// usable offers of a policy. Configuration is the router's (AI_ROUTER_LIB, AI_ROUTER_CATALOG, AI_ROUTER_LOCAL,
// provider credentials in the environment).
// bun server.ts [--port N] [--open]
import index from "./web/index.html";
import { Router, type RouterConfig } from "@aphrody/ai-router";

const argv = Bun.argv.slice(2);
const port = Number(argv.includes("--port") ? argv[argv.indexOf("--port") + 1] : (Bun.env.PORT ?? 0));
const config: RouterConfig = { local: Bun.env.AI_ROUTER_LOCAL?.split(",").map((s) => s.trim()).filter(Boolean) };
const router = new Router(config);

const server = Bun.serve({
  port,
  idleTimeout: 255,
  development: process.env.NODE_ENV !== "production" ? { hmr: true, console: true } : false,
  routes: {
    "/api/models": (req) => Response.json(router.models(new URL(req.url).searchParams.get("policy") ?? "auto")),
    "/api/chat": {
      POST: async (req, srv) => {
        srv.timeout(req, 0);
        const request = await req.json();
        const worker = new Worker(new URL("./chat-worker.ts", import.meta.url).href);
        const stream = new ReadableStream({
          start(c) {
            worker.onmessage = (e: MessageEvent<{ chunk?: unknown; summary?: unknown }>) => {
              if (e.data.chunk) c.enqueue(`data: ${JSON.stringify(e.data.chunk)}\n\n`);
              if (e.data.summary) {
                c.enqueue(`event: router\ndata: ${JSON.stringify(e.data.summary)}\n\n`);
                c.close();
                worker.terminate();
              }
            };
            worker.postMessage({ config, request });
          },
          cancel: () => worker.terminate(),
        });
        return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-store" } });
      },
    },
    "/*": index,
  },
});
console.log(`ai-router app ${server.url}`);
// --open: the desktop case, the app opens in the system browser
if (argv.includes("--open")) {
  const opener = process.platform === "win32" ? ["cmd", "/c", "start", "", server.url.href] : [process.platform === "darwin" ? "open" : "xdg-open", server.url.href];
  Bun.spawn(opener, { stdout: "ignore", stderr: "ignore" });
}
