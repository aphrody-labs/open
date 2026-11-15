// Bun API surface, read from the running Bun itself: every property of the `Bun` global (namespaces walked
// recursively), the exports of each `bun:*` module, and Bun-specific globals. This is exactly what the
// application can call on the Bun build that compiles it; api.json is the reference the coverage proof uses.
// bun gen/api.ts
import { join } from "node:path";

const app = join(import.meta.dir, "..");
const out: { name: string; kind: string }[] = [];
const seen = new WeakSet<object>();

function walk(name: string, value: unknown, depth: number) {
  const kind = typeof value === "function" ? (/^class\s/.test(Function.prototype.toString.call(value)) || /^[A-Z]/.test(name.split(".").pop()!) ? "class" : "function") : typeof value;
  out.push({ name, kind });
  // runtime data, not API: never list environment variables or arguments
  if (name === "Bun.env" || name === "Bun.argv") return;
  if (depth >= 3 || value === null || (typeof value !== "object" && typeof value !== "function")) return;
  if (seen.has(value as object)) return;
  seen.add(value as object);
  // namespaces only: plain objects and Bun namespace functions with static members (Bun.semver, Bun.password, ...)
  const keys = Object.getOwnPropertyNames(value).filter((k) => !["length", "name", "prototype", "caller", "arguments"].includes(k));
  if (typeof value === "function" && keys.length === 0) return;
  for (const k of keys.sort()) {
    let v: unknown;
    try { v = (value as any)[k]; } catch { continue; }
    walk(`${name}.${k}`, v, depth + 1);
  }
}

walk("Bun", Bun, 0);
const modules = ["bun:sqlite", "bun:ffi", "bun:jsc", "bun:test", "bun:bundle"];
const moduleCounts: Record<string, number | string> = {};
for (const m of modules) {
  try {
    const mod = await import(m);
    const keys = Object.keys(mod).filter((k) => k !== "default");
    for (const k of keys.sort()) out.push({ name: `${m}:${k}`, kind: typeof mod[k] });
    moduleCounts[m] = keys.length;
  } catch (e) {
    moduleCounts[m] = `not importable here: ${String((e as Error).message).split("\n")[0]}`;
  }
}
for (const g of ["HTMLRewriter", "Bun", "BuildMessage", "ResolveMessage"]) if (g in globalThis) out.push({ name: `global:${g}`, kind: typeof (globalThis as any)[g] });

const values = out.filter((o) => o.name !== "Bun");
await Bun.write(join(app, "api.json"), `${JSON.stringify({ bun: Bun.version, revision: Bun.revision, count: values.length, modules: moduleCounts, values }, null, 2)}\n`);
console.log(`Bun ${Bun.version}: ${values.length} API entries`, JSON.stringify(moduleCounts));
