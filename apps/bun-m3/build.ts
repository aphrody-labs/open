// One executable: the server compiled ahead of time to machine code (Bun AOT), the Angular Material client bundled
// by Bun (Sass through the plugin) and every data file embedded. Without --target, builds for this machine.
// bun build.ts [--target bun-linux-x64-modern ...] [--no-aot]
import { join } from "node:path";
import sass from "./sass.ts";

const app = import.meta.dir;
const argv = Bun.argv.slice(2);
const target = argv.includes("--target") ? (argv[argv.indexOf("--target") + 1] as Bun.Build.CompileTarget) : undefined;
const aot = !argv.includes("--no-aot");
// The examples run on this executable as `bun` (BUN_BE_BUN), so it keeps every feature of the runtime: the AOT
// build would otherwise leave out the command line, the JIT and every API the server itself does not call.
// The feature names are read from bun-types (Bun.Build.TrimFeature) of the Bun fork the docs come from.
const typesDir = [join(app, "node_modules/bun-types"), join(app, "../../.cache/bun-fork/packages/bun-types")].find((d) => Bun.file(join(d, "bun.d.ts")).size > 0);
if (!typesDir) throw new Error("bun-types not found: run gen sources first (.cache/bun-fork) or install bun-types");
const types = await Bun.file(join(typesDir, "bun.d.ts")).text();
const features = [...(types.match(/type TrimFeature =([\s\S]*?);/)?.[1] ?? "").matchAll(/"([a-z-]+)"/g)].map((m) => m[1]!) as Bun.Build.TrimFeature[];
if (!features.length) throw new Error("Bun.Build.TrimFeature not found in bun-types");
const outfile = join(app, "dist", `bun-m3${target ? `-${target}` : ""}`);
const t0 = performance.now();
const r = await Bun.build({
  entrypoints: [join(app, "server.ts")],
  compile: { outfile, aot, ...(target ? { target } : {}), trim: { allow: features }, assets: [join(app, "skills")], autoloadBunfig: false, autoloadDotenv: false },
  plugins: [sass],
  minify: true,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});
for (const l of r.logs) console.log(l.level, l.message);
if (!r.success) process.exit(1);
const exe = r.outputs.find((o) => o.kind === "entry-point")?.path ?? outfile;
console.log(JSON.stringify({ exe, aot, features: features.length, target: target ?? "host", bytes: Bun.file(exe).size, seconds: +((performance.now() - t0) / 1000).toFixed(1) }));
