// Runs the code examples of a Bun doc page: each example is written to its own sandbox directory and executed by
// this very Bun (the compiled executable acts as `bun` through BUN_BE_BUN). Every access to the Bun API is
// recorded: `Bun` is shadowed by a recording proxy and `bun` / `bun:*` imports go through generated shims, so the
// coverage report measures what actually ran, not what the text mentions.
import { Database } from "bun:sqlite";
import { copyFileSync, existsSync, linkSync, mkdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, isAbsolute, join, relative } from "node:path";

export type Snip = { id: number; lang: string; file: string | null; code: string; run: "script" | "test" | "shell" | null };
export type Run = { skill: string; id: number; status: "pass" | "fail" | "timeout" | "skipped"; exit: number | null; ms: number; stdout: string; stderr: string; apis: string[]; reason?: string; at: string };

export const dataDir = Bun.env.BUN_M3_DATA ?? join(tmpdir(), "bun-m3");
const runsDir = join(dataDir, "runs");
mkdirSync(runsDir, { recursive: true });
// Package-manager examples search upward for package.json, bunfig.toml and workspaces: the sandboxes must not
// live under any project, or an example like `bun add` edits that project.
for (let d = dataDir; ; ) {
  for (const f of ["package.json", "bunfig.toml", "bun.lock", ".git"])
    if (existsSync(join(d, f))) throw new Error(`BUN_M3_DATA (${dataDir}) is inside a project (${join(d, f)}); choose a directory outside any project`);
  const up = dirname(d);
  if (up === d) break;
  d = up;
}

// `bun` on the sandbox PATH is this very Bun (a compiled executable acts as bun through BUN_BE_BUN)
const binDir = join(dataDir, "bin");
mkdirSync(binDir, { recursive: true });
const bunBin = join(binDir, process.platform === "win32" ? "bun.exe" : "bun");
if (!existsSync(bunBin) || statSync(bunBin).size !== statSync(process.execPath).size) {
  rmSync(bunBin, { force: true });
  try { linkSync(process.execPath, bunBin); } catch { copyFileSync(process.execPath, bunBin); }
}

export const db = new Database(join(dataDir, "runs.sqlite"), { create: true, strict: true });
db.run("PRAGMA journal_mode = WAL");
db.run(`CREATE TABLE IF NOT EXISTS runs (skill TEXT NOT NULL, id INTEGER NOT NULL, status TEXT NOT NULL, exit INTEGER, ms REAL NOT NULL,
  stdout TEXT NOT NULL, stderr TEXT NOT NULL, apis TEXT NOT NULL, reason TEXT, at TEXT NOT NULL, PRIMARY KEY (skill, id))`);
const save = db.prepare(`INSERT OR REPLACE INTO runs VALUES ($skill, $id, $status, $exit, $ms, $stdout, $stderr, $apis, $reason, $at)`);
const bySkill = db.prepare(`SELECT * FROM runs WHERE skill = $skill ORDER BY id`);
const all = db.prepare(`SELECT skill, id, status, apis FROM runs`);

const row = (r: Record<string, unknown>): Run => ({ ...(r as unknown as Run), apis: JSON.parse(r.apis as string), reason: (r.reason as string | null) ?? undefined });
export const runsOf = (skill: string) => (bySkill.all({ skill }) as Record<string, unknown>[]).map(row);
export const allRuns = () => all.all() as { skill: string; id: number; status: Run["status"]; apis: string }[];

// Recorder loaded by every instrumented example. Proxies wrap an empty shadow target so that the invariants of
// Bun's non-configurable properties never apply; calls are forwarded to the real value with the real receiver.
const recorder = `
const seen = new Set();
const real = new WeakMap();
// written as soon as a new API is reached: test runners and crashes do not always run exit handlers
const note = (k) => { if (seen.has(k)) return; seen.add(k); require("node:fs").writeFileSync(process.env.BUN_M3_COV, JSON.stringify([...seen])); };
export function __cov(v, path) {
  if (v === null || (typeof v !== "object" && typeof v !== "function")) return v;
  const shadow = typeof v === "function" ? function () {} : {};
  const p = new Proxy(shadow, {
    get(_, k) {
      const x = Reflect.get(v, k, v);
      if (typeof k !== "string") return x;
      note(path + "." + k);
      return typeof x === "function" || (x && typeof x === "object") ? __cov(x, path + "." + k) : x;
    },
    set(_, k, x) { return Reflect.set(v, k, x, v); },
    has(_, k) { return Reflect.has(v, k); },
    ownKeys(t) { return [...new Set([...Reflect.ownKeys(v), ...Reflect.ownKeys(t).filter((k) => !Reflect.getOwnPropertyDescriptor(t, k).configurable)])]; },
    getOwnPropertyDescriptor(t, k) { const d = Reflect.getOwnPropertyDescriptor(v, k); return d && !Reflect.getOwnPropertyDescriptor(t, k) ? { ...d, configurable: true } : Reflect.getOwnPropertyDescriptor(t, k); },
    getPrototypeOf() { return Reflect.getPrototypeOf(v); },
    apply(_, self, args) { note(path); return Reflect.apply(v, real.get(self) ?? self, args); },
    construct(_, args, nt) { note(path); return Reflect.construct(v, args, nt === p ? v : nt); },
  });
  real.set(p, v);
  return p;
}
`;

// Shims for `bun` and `bun:*`, generated from the module exports of the running Bun.
const modules = ["bun", "bun:sqlite", "bun:ffi", "bun:jsc", "bun:test"] as const;
const shimFile = (m: string) => `${m.replace(":", "-")}.js`;
async function shim(m: string): Promise<string> {
  const mod = (await import(m)) as Record<string, unknown>;
  const label = m === "bun" ? "Bun" : m;
  const sep = m === "bun" ? "." : ":";
  const names = Object.keys(mod).filter((k) => k !== "default" && /^[A-Za-z_$][\w$]*$/.test(k));
  return [
    `import * as m from ${JSON.stringify(m)};`,
    `import { __cov } from "./cov.js";`,
    ...names.map((k) => `export const ${k} = __cov(m[${JSON.stringify(k)}], ${JSON.stringify(label + sep + k)});`),
    `export default __cov(m.default ?? m, ${JSON.stringify(label)});`,
  ].join("\n");
}
const shims = Object.fromEntries(await Promise.all(modules.map(async (m) => [m, await shim(m).catch(() => null)] as const)));

const globalsOfBun = ["HTMLRewriter", "BuildMessage", "ResolveMessage"];
function instrument(code: string, cov = "./.cov"): string {
  const rewritten = code.replace(/(\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)(["'])(bun(?::\w+)?)\2/gm, (all, pre, q, spec) =>
    shims[spec] ? `${pre}${q}${cov}/${shimFile(spec)}${q}` : all,
  );
  const declares = (name: string) => new RegExp(`\\b(?:const|let|var|function|class|import)\\s+(?:\\{[^}]*\\b)?${name}\\b|\\bimport\\s+${name}\\b`).test(code);
  const head = [`import { __cov as __bunM3Cov } from "${cov}/cov.js";`];
  if (!declares("Bun")) head.push(`const Bun = __bunM3Cov(globalThis.Bun, "Bun");`);
  for (const g of globalsOfBun) if (new RegExp(`\\b${g}\\b`).test(code) && !declares(g)) head.push(`const ${g} = __bunM3Cov(globalThis.${g}, "global:${g}");`);
  // a shebang must stay on the first line
  const shebang = rewritten.match(/^#![^\n]*\n/)?.[0] ?? "";
  return `${shebang}${head.join(" ")}\n${rewritten.slice(shebang.length)}`;
}

// Examples whose effect reaches outside the sandbox directory are not run: global installs, upgrades,
// publishing, shell configuration, the OS credential store, the clipboard and editor windows.
const outsideScript = /\bBun\.secrets\b|\bsecrets\.(?:set|delete)\b|\bopenInEditor\b|\bwriteClipboard|\bclipboard\.write/;
const outside = /^\s*(?:\$\s*)?bunx?\s+(?:upgrade|publish|feedback|completions|link|unlink)\b|\s(?:-g|--global)\b|\bpm\s+cache\s+rm\b|\b(?:login|logout|auth)\b/;

function env(dir: string, cov: string): Record<string, string> {
  const keep = ["PATH", "SystemRoot", "windir", "COMSPEC", "PATHEXT", "TEMP", "TMP", "TMPDIR", "LANG"];
  const e: Record<string, string> = {};
  for (const k of keep) if (process.env[k]) e[k] = process.env[k]!;
  // no user-wide package binaries (`bun x` resolves inside the sandbox) and no Node.js: a `#!/usr/bin/env node`
  // tool runs on Bun through run.bun in the sandbox bunfig.toml, which puts a `node` alias of bun on PATH
  const node = process.platform === "win32" ? "node.exe" : "node";
  if (e.PATH) e.PATH = e.PATH.split(delimiter).filter((p) => p && !/[\\/](?:\.bun|npm|pnpm|yarn|node_modules|\.cargo)[\\/]?/i.test(p) && !existsSync(join(p, node))).join(delimiter);
  e.PATH = [binDir, e.PATH ?? ""].join(delimiter);
  return { ...e, HOME: join(dir, ".home"), USERPROFILE: join(dir, ".home"), BUN_INSTALL: join(dir, ".bun"), BUN_INSTALL_CACHE_DIR: join(dataDir, "cache"), BUN_BE_BUN: "1", BUN_M3_COV: cov, NO_COLOR: "1" };
}

const extOf = (lang: string) => ({ typescript: "ts", javascript: "js" })[lang] ?? lang;
const clip = (s: string) => (s.length > 64_000 ? `${s.slice(0, 64_000)}\n[truncated]` : s);

// The named files of a page (`db.ts`, `package.json`, `index.html`, ...) are written into its sandbox before any
// example runs, as a reader following the page would have them; scripts are instrumented, other files kept as is.
async function materialize(dir: string, page: Snip[]) {
  for (const b of page) {
    if (!b.file || isAbsolute(b.file) || b.file.split(/[\\/]/).includes("..")) continue;
    const path = join(dir, b.file);
    if (existsSync(path)) continue;
    mkdirSync(dirname(path), { recursive: true });
    const cov = relative(dirname(path), join(dir, ".cov")).replaceAll("\\", "/");
    await Bun.write(path, b.run === "script" || b.run === "test" ? instrument(b.code, cov.startsWith(".") ? cov : `./${cov}`) : b.code);
  }
}

export async function run(skill: string, s: Snip, timeoutMs = 10_000, page: Snip[] = []): Promise<Run> {
  const at = new Date().toISOString();
  const base = { skill, id: s.id, at, apis: [] as string[] };
  if (!s.run) return { ...base, status: "skipped", exit: null, ms: 0, stdout: "", stderr: "", reason: `not runnable (${s.lang || "plain"})` };
  if ((s.run === "shell" && outside.test(s.code)) || (s.run !== "shell" && outsideScript.test(s.code))) {
    const r: Run = { ...base, status: "skipped", exit: null, ms: 0, stdout: "", stderr: "", reason: "acts outside the sandbox (global install, upgrade, publish, shell config, credential store, clipboard, editor)" };
    persist(r);
    return r;
  }
  // one directory per page: examples on a page build on each other (files written by one are read by the next)
  const dir = join(runsDir, skill);
  mkdirSync(join(dir, ".cov"), { recursive: true });
  mkdirSync(join(dir, ".home"), { recursive: true });
  // each page sandbox is its own package root, so package-manager examples stop here
  if (!existsSync(join(dir, "package.json"))) await Bun.write(join(dir, "package.json"), `${JSON.stringify({ name: `sandbox-${skill}`, private: true })}\n`);
  if (!existsSync(join(dir, "bunfig.toml"))) await Bun.write(join(dir, "bunfig.toml"), "[run]\nbun = true\n");
  await Bun.write(join(dir, ".cov", "cov.js"), recorder);
  for (const [m, src] of Object.entries(shims)) if (src) await Bun.write(join(dir, ".cov", shimFile(m)), src);
  await materialize(dir, page);
  const cov = join(dir, ".cov", `seen-${s.id}.json`);
  rmSync(cov, { force: true });
  const exe = process.execPath;
  let cmd: string[];
  if (s.run === "shell") {
    const lines = s.code.split("\n").map((l) => l.replace(/^\s*\$\s+/, "")).filter((l) => /^\s*bunx?\s/.test(l));
    const script = lines.map((l) => l.replace(/^\s*bunx\s/, `"${exe}" x `).replace(/^\s*bun\s/, `"${exe}" `)).join("\n");
    await Bun.write(join(dir, "commands.sh"), script);
    cmd = [exe, "exec", script];
  } else {
    const name = s.file && !s.file.includes("/") ? s.file : `snippet.${extOf(s.lang)}`;
    const file = s.run === "test" && !/\.(test|spec)\.\w+$/.test(name) ? name.replace(/\.(\w+)$/, ".test.$1") : name;
    await Bun.write(join(dir, file), instrument(s.code));
    cmd = s.run === "test" ? [exe, "test", `./${file}`] : [exe, "run", `./${file}`];
  }
  const t0 = performance.now();
  const p = Bun.spawn(cmd, { cwd: dir, env: env(dir, cov), stdin: "ignore", stdout: "pipe", stderr: "pipe", detached: process.platform !== "win32" });
  // on timeout the whole process tree goes (a dev server an example starts outlives its parent otherwise)
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    if (process.platform === "win32") Bun.spawnSync(["taskkill", "/T", "/F", "/PID", String(p.pid)], { stdout: "ignore", stderr: "ignore" });
    else try { process.kill(-p.pid, "SIGKILL"); } catch { p.kill("SIGKILL"); }
  }, timeoutMs);
  const [stdout, stderr, exit] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
  clearTimeout(timer);
  const ms = performance.now() - t0;
  const apis: string[] = await Bun.file(cov).json().catch(() => []);
  const status: Run["status"] = timedOut ? "timeout" : exit === 0 ? "pass" : "fail";
  const r: Run = { ...base, status, exit, ms, stdout: clip(stdout), stderr: clip(stderr), apis, at };
  persist(r);
  return r;
}

function persist(r: Run) {
  save.run({ skill: r.skill, id: r.id, status: r.status, exit: r.exit, ms: r.ms, stdout: r.stdout, stderr: r.stderr, apis: JSON.stringify(r.apis), reason: r.reason ?? null, at: r.at });
}
