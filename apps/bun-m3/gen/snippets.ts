// Code examples of every Bun doc page: the fenced blocks of each MDX (ts, tsx, js, jsx, sh/bash with `bun`
// commands), keyed by skill. These are the "usage of the feature the page describes" that the server runs.
// Output: snippets.json.
// bun gen/snippets.ts [--docs <dir>]
import { join } from "node:path";

const app = join(import.meta.dir, "..");
const argv = Bun.argv.slice(2);
const docs = argv.includes("--docs") ? argv[argv.indexOf("--docs") + 1]! : join(app, "../../.cache/bun-fork/docs");
const skills = (await Bun.file(join(app, "skills.json")).json()).skills as { name: string; source: string }[];

const runnable = new Set(["ts", "tsx", "js", "jsx", "typescript", "javascript", "mjs", "cjs"]);
const out: Record<string, { lang: string; title: string | null; code: string; runnable: boolean }[]> = {};
let total = 0, run = 0;
for (const s of skills) {
  const src = await Bun.file(join(docs, s.source)).text();
  const blocks = [];
  for (const m of src.matchAll(/^([ \t]*)```([\w+-]*)([^\n]*)\n([\s\S]*?)^\1```/gm)) {
    const lang = (m[2] || "").toLowerCase();
    const title = m[3]?.match(/(?:title=)?["']?([\w./@-]+\.\w+)["']?/)?.[1] ?? m[3]?.trim() ?? null;
    const code = m[4]!.replace(new RegExp(`^${m[1]}`, "gm"), "");
    const isRunnable = runnable.has(lang) || ((lang === "sh" || lang === "bash") && /^\s*bun\s/m.test(code));
    blocks.push({ lang, title: title || null, code, runnable: isRunnable });
    total++;
    if (isRunnable) run++;
  }
  if (blocks.length) out[s.name] = blocks;
}
await Bun.write(join(app, "snippets.json"), `${JSON.stringify(out)}\n`);
console.log(`${total} code blocks in ${Object.keys(out).length} skills; ${run} runnable (TS/JS or bun commands)`);
