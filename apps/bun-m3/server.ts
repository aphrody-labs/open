// Bun fullstack server: the Angular Material client (HTML import, bundled by Bun) and the API that runs the
// examples of every Bun doc page and reports what they used. Compiled to one executable by build.ts.
// bun server.ts [--port N]
import index from "./web/index.html";
import pages from "./pages.json" with { type: "json" };
import snippets from "./snippets.json" with { type: "json" };
import skills from "./skills.json" with { type: "json" };
import api from "./api.json" with { type: "json" };
import kit from "./kit/kit.json" with { type: "json" };
import material from "./kit/angular-material.json" with { type: "json" };
import theme from "./theme/theme.json" with { type: "json" };
import sources from "./sources.json" with { type: "json" };
import { availableParallelism } from "node:os";
import { join } from "node:path";
import { allRuns, confinement, db, run, runsOf, type Snip, type Status } from "./runner.ts";

const runRows = () => db.query("SELECT skill, id, status, ms, at FROM runs ORDER BY at DESC").all();

type Page = (typeof pages)[keyof typeof pages];
const P = pages as Record<string, Page>;
const S = snippets as Record<string, Snip[]>;
const argv = Bun.argv.slice(2);
const port = Number(argv.includes("--port") ? argv[argv.indexOf("--port") + 1] : (Bun.env.PORT ?? 0));

// Run-all queue: every runnable example of the selected pages, a worker per core.
let job: { total: number; done: number; started: string; counts: Record<Status, number> } | null = null;
const listeners = new Set<(e: object) => void>();
const emit = (e: object) => listeners.forEach((l) => l(e));
async function runAll(filter: (skill: string) => boolean, timeoutMs: number) {
  if (job && job.done < job.total) return job;
  const queue = Object.entries(S).filter(([k]) => filter(k)).flatMap(([skill, xs]) => xs.filter((s) => s.run).map((s) => ({ skill, s })));
  const j = (job = { total: queue.length, done: 0, started: new Date().toISOString(), counts: { pass: 0, fail: 0, timeout: 0, serving: 0, skipped: 0 } });
  // examples of one page run in order (shared sandbox directory); pages run in parallel
  const byPage = Map.groupBy(queue, (q) => q.skill);
  const pagesQ = [...byPage.values()];
  const worker = async () => {
    for (let q = pagesQ.shift(); q; q = pagesQ.shift())
      for (const { skill, s } of q) {
        // a run that cannot even start (disk full, quota) is a failure of that example, not of the whole run
        const status: Status = await run(skill, s, timeoutMs, S[skill]).then((r) => r.status, (e) => (console.error(`${skill}#${s.id}: ${e}`), "fail"));
        j.done++;
        j.counts[status]++;
        emit({ type: "run", skill, id: s.id, status, done: j.done, total: j.total });
      }
  };
  Promise.all(Array.from({ length: availableParallelism() }, worker)).then(() => emit({ type: "done", ...j }));
  return j;
}

function coverage() {
  const runs = allRuns();
  // recorded names: `Bun.serve()` for a call or construction, `Bun.version` for a read of a non-function value
  const recorded = new Map<string, number>();
  for (const r of runs) for (const a of JSON.parse(r.apis) as string[]) recorded.set(a, (recorded.get(a) ?? 0) + 1);
  const names = [...recorded.keys()];
  const below = (n: string) => names.some((u) => u.startsWith(`${n}.`) || u.startsWith(`${n}:`));
  // a function is used when called, a class when constructed or one of its static members is called, a namespace
  // object when read or one of its members is used, any other value when read; a global when any member is used
  const used = (v: { name: string; kind: string }) => {
    const g = v.name.match(/^global:(.+)$/)?.[1];
    if (g) return names.some((u) => u.startsWith(`${g}.`) || u.startsWith(`global:${g}`));
    if (v.kind === "function") return recorded.has(`${v.name}()`);
    if (v.kind === "class") return recorded.has(`${v.name}()`) || names.some((u) => u.startsWith(`${v.name}.`) && u.endsWith("()"));
    if (v.kind === "object") return recorded.has(v.name) || below(v.name);
    return recorded.has(v.name);
  };
  const entries = api.values.map((v) => ({ ...v, calls: recorded.get(`${v.name}()`) ?? recorded.get(v.name) ?? 0, used: used(v) }));
  const status = runs.reduce<Record<string, number>>((a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
  const runnable = Object.values(S).flat().filter((s) => s.run).length;
  const m3 = Object.keys(kit.byComponent).map((name) => {
    const m = (material.map as Record<string, { entry: string | null; selector?: string; reason?: string; partial?: string }>)[name];
    return { name, figma: (kit.byComponent as Record<string, unknown[]>)[name]!.length, angular: m?.entry ?? null, selector: m?.selector ?? null, partial: m?.partial ?? null, reason: m?.reason ?? (m ? null : "not mapped") };
  });
  return {
    bun: { version: Bun.version, revision: Bun.revision, total: entries.length, used: entries.filter((e) => e.used).length, entries },
    runs: { runnable, executed: runs.length, status, confinement },
    kit: { library: kit.library, componentSets: kit.componentSets, m3Components: m3.length, implemented: m3.filter((c) => c.angular).length, components: m3 },
  };
}

const server = Bun.serve({
  port,
  // an example may run up to its timeout before the response is written
  idleTimeout: 255,
  development: process.env.NODE_ENV !== "production" ? { hmr: true, console: true } : false,
  routes: {
    "/api/index": () =>
      Response.json(
        skills.skills.map((s) => ({ name: s.name, title: s.title, section: P[s.name]!.tab, group: P[s.name]!.group, description: s.description, examples: S[s.name]?.length ?? 0, runnable: S[s.name]?.filter((x) => x.run).length ?? 0 })),
      ),
    "/api/sources": () => Response.json(sources),
    "/api/theme": () => Response.json({ source: theme.source, variant: theme.variant, sourceAsset: theme.sourceAsset, schemes: Object.keys(theme.schemes) }),
    "/api/pages/:name": (req) => {
      const page = P[req.params.name];
      return page ? Response.json({ name: req.params.name, ...page, runs: runsOf(req.params.name) }) : Response.json({ error: "no such page" }, { status: 404 });
    },
    "/api/run/:name/:id": {
      POST: async (req) => {
        const s = S[req.params.name]?.find((x) => x.id === Number(req.params.id));
        if (!s) return Response.json({ error: "no such example" }, { status: 404 });
        return Response.json(await run(req.params.name, s, Number(new URL(req.url).searchParams.get("timeout") ?? 10_000), S[req.params.name]));
      },
    },
    "/api/run-all": {
      POST: async (req) => {
        const q = new URL(req.url).searchParams;
        const section = q.get("section");
        return Response.json(await runAll((k) => !section || P[k]?.tab === section, Number(q.get("timeout") ?? 10_000)));
      },
      GET: () => Response.json(job),
    },
    "/api/events": (req, srv) => {
      srv.timeout(req, 0);
      const stream = new ReadableStream({
        start(c) {
          const l = (e: object) => c.enqueue(`data: ${JSON.stringify(e)}\n\n`);
          listeners.add(l);
          req.signal.addEventListener("abort", () => listeners.delete(l));
        },
      });
      return new Response(stream, { headers: { "content-type": "text/event-stream", "cache-control": "no-store" } });
    },
    "/api/skills/:name": async (req) => {
      // the generated skills ship inside the executable (compile.assets) next to the server
      const file = Bun.file(join(import.meta.dir, "skills", req.params.name.replace(/[^a-z0-9-]/g, ""), "SKILL.md"));
      return (await file.exists()) ? new Response(file, { headers: { "content-type": "text/markdown; charset=utf-8" } }) : Response.json({ error: "no such skill" }, { status: 404 });
    },
    "/api/coverage": () => Response.json(coverage()),
    "/api/runs": () => Response.json(runRows()),
    "/api/*": () => Response.json({ error: "not found" }, { status: 404 }),
    "/*": index,
  },
});
console.log(`bun-m3 ${server.url}`);
