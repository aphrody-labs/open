// Runs the code examples of a Bun doc page and records which Bun APIs each one reaches. Each page has a working
// directory outside any project; the examples run on this very Bun (a compiled executable acts as `bun` through
// BUN_BE_BUN). Confinement: on Linux every run goes through bubblewrap when it is installed (read-only root,
// private /tmp and home, own PID namespace); on Windows every run is in a Job Object that kills the whole process
// tree on timeout and on exit. Recording: `Bun` is shadowed by a recording proxy and `bun` / `bun:*` imports go
// through generated shims; calls and reads are appended to a per-run NDJSON file.
import { Database } from "bun:sqlite";
import { dlopen, FFIType } from "bun:ffi";
import { copyFileSync, existsSync, linkSync, mkdirSync, rmSync, statSync, statfsSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, isAbsolute, join, relative } from "node:path";

export type Snip = { id: number; lang: string; file: string | null; code: string; run: "script" | "test" | "shell" | null };
export type Status = "pass" | "fail" | "timeout" | "serving" | "skipped";
export type Run = { skill: string; id: number; status: Status; exit: number | null; ms: number; stdout: string; stderr: string; apis: string[]; reason?: string; at: string };

// The per-user state directory of the platform (disk-backed, unlike a tmpfs /tmp): LOCALAPPDATA on Windows,
// XDG_STATE_HOME or ~/.local/state elsewhere. BUN_M3_DATA overrides it.
const stateHome = process.platform === "win32" ? (Bun.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local")) : (Bun.env.XDG_STATE_HOME ?? join(homedir(), ".local", "state"));
export const dataDir = Bun.env.BUN_M3_DATA ?? join(stateHome, "bun-m3");
const runsDir = join(dataDir, "runs");
const cacheDir = join(dataDir, "cache");
mkdirSync(runsDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });
// Package managers and module resolution search parent directories for package.json, bunfig.toml and
// node_modules: under a project, an example like `bun add` would edit that project.
for (let d = dataDir; ; ) {
  for (const f of ["package.json", "bunfig.toml", "node_modules"])
    if (existsSync(join(d, f))) throw new Error(`BUN_M3_DATA (${dataDir}) is below ${join(d, f)}; choose a directory outside any project`);
  const up = dirname(d);
  if (up === d) break;
  d = up;
}

// `bun` on the sandbox PATH is this very Bun
const binDir = join(dataDir, "bin");
mkdirSync(binDir, { recursive: true });
const bunBin = join(binDir, process.platform === "win32" ? "bun.exe" : "bun");
if (!existsSync(bunBin) || statSync(bunBin).size !== statSync(process.execPath).size) {
  rmSync(bunBin, { force: true });
  try {
    linkSync(process.execPath, bunBin);
  } catch {
    copyFileSync(process.execPath, bunBin);
  }
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
export const allRuns = () => all.all() as { skill: string; id: number; status: Status; apis: string }[];

// Recorder loaded by every instrumented example. A proxy wraps an empty shadow target so that the invariants of
// Bun's non-configurable properties never apply. Calls (`name()`) and reads of non-function values (`name`) are
// appended once each to BUN_M3_COV (append, so child processes and workers of an example add to the same file).
// Protocol lookups (then, toJSON, constructor, ...) are not uses. Arguments and receivers are unwrapped before
// they reach native code, so Bun never sees a proxy.
const recorder = `
const fs = require("node:fs");
const seen = new Set();
const real = new WeakMap();
const protocol = new Set(["then", "toJSON", "constructor", "prototype", "valueOf", "toString", "length", "name", "inspect", "$$typeof", "asymmetricMatch", "nodeType"]);
const note = (k) => { if (seen.has(k)) return; seen.add(k); try { fs.appendFileSync(process.env.BUN_M3_COV, JSON.stringify(k) + "\\n"); } catch {} };
const raw = (x) => (x !== null && (typeof x === "object" || typeof x === "function") && real.get(x)) || x;
export function __cov(v, path) {
  if (v === null || (typeof v !== "object" && typeof v !== "function")) return v;
  const shadow = typeof v === "function" ? function () {} : {};
  const p = new Proxy(shadow, {
    get(_, k) {
      const x = Reflect.get(v, k, v);
      if (typeof k !== "string" || protocol.has(k)) return x;
      if (typeof x !== "function") note(path + "." + k);
      return typeof x === "function" || (x && typeof x === "object") ? __cov(x, path + "." + k) : x;
    },
    set(_, k, x) { return Reflect.set(v, k, raw(x), v); },
    has(_, k) { return Reflect.has(v, k); },
    ownKeys(t) { return [...new Set([...Reflect.ownKeys(v), ...Reflect.ownKeys(t).filter((k) => !Reflect.getOwnPropertyDescriptor(t, k).configurable)])]; },
    getOwnPropertyDescriptor(t, k) { const d = Reflect.getOwnPropertyDescriptor(v, k); return d && !Reflect.getOwnPropertyDescriptor(t, k) ? { ...d, configurable: true } : Reflect.getOwnPropertyDescriptor(t, k); },
    getPrototypeOf() { return Reflect.getPrototypeOf(v); },
    apply(_, self, args) { note(path + "()"); return Reflect.apply(v, raw(self), args.map(raw)); },
    construct(_, args, nt) { note(path + "()"); return Reflect.construct(v, args.map(raw), nt === p ? v : nt); },
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

// Examples whose effect reaches outside the working directory are not run: global installs, upgrades, publishing,
// trusting lifecycle scripts, logins, shell configuration, the OS credential store, the clipboard and editor windows.
const outsideScript = /\bBun\.secrets\b|\bsecrets\.(?:set|delete)\b|\bopenInEditor\b|\bwriteClipboard|\bclipboard\.write/;
const outside = /^\s*(?:\$\s*)?bunx?\s+(?:upgrade|publish|feedback|completions|link|unlink)\b|\s(?:-g|--global|--trust)\b|\bpm\s+(?:cache\s+rm|trust)\b|\b(?:login|logout|auth)\b/;

function env(dir: string, cov: string): Record<string, string> {
  const keep = ["PATH", "SystemRoot", "windir", "COMSPEC", "PATHEXT", "LANG"];
  const e: Record<string, string> = {};
  for (const k of keep) if (process.env[k]) e[k] = process.env[k]!;
  // no user-wide package binaries (`bun x` resolves inside the sandbox) and no Node.js: a `#!/usr/bin/env node`
  // tool runs on Bun through run.bun in the sandbox bunfig.toml, which puts a `node` alias of bun on PATH
  const node = process.platform === "win32" ? "node.exe" : "node";
  if (e.PATH) e.PATH = e.PATH.split(delimiter).filter((p) => p && !/[\\/](?:\.bun|npm|pnpm|yarn|node_modules|\.cargo)[\\/]?/i.test(p) && !existsSync(join(p, node))).join(delimiter);
  e.PATH = [binDir, e.PATH ?? ""].join(delimiter);
  // home, temporary, configuration and cache directories all point inside the working directory
  const home = join(dir, ".home"), tmp = join(dir, ".tmp");
  const dirs = { HOME: home, USERPROFILE: home, APPDATA: join(home, "AppData", "Roaming"), LOCALAPPDATA: join(home, "AppData", "Local"), XDG_CONFIG_HOME: join(home, ".config"), XDG_CACHE_HOME: join(home, ".cache"), XDG_DATA_HOME: join(home, ".local", "share"), TEMP: tmp, TMP: tmp, TMPDIR: tmp };
  for (const d of Object.values(dirs)) mkdirSync(d, { recursive: true });
  return { ...e, ...dirs, BUN_INSTALL: join(dir, ".bun"), BUN_INSTALL_CACHE_DIR: cacheDir, BUN_BE_BUN: "1", BUN_M3_COV: cov, NO_COLOR: "1" };
}

// Linux: bubblewrap when installed. Read-only root, private /tmp and home (the user's files are not visible),
// writable working directory and package cache, own PID, IPC and UTS namespaces, dies with the server.
const bwrap = process.platform === "linux" ? Bun.which("bwrap") : null;
function confine(cmd: string[], dir: string): string[] {
  if (!bwrap) return cmd;
  const binds = [["--bind", dir], ["--bind", cacheDir], ["--ro-bind", binDir], ["--ro-bind", dirname(process.execPath)]].flatMap(([o, p]) => [o!, p!, p!]);
  return [bwrap, "--ro-bind", "/", "/", "--dev", "/dev", "--proc", "/proc", "--tmpfs", "/tmp", "--tmpfs", homedir(), ...binds, "--unshare-pid", "--unshare-ipc", "--unshare-uts", "--die-with-parent", "--new-session", "--chdir", dir, "--", ...cmd];
}
export const confinement = bwrap ? `bubblewrap (${bwrap})` : process.platform === "win32" ? "Windows Job Object" : "process group";

// Windows: one Job Object per run with JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE; closing it ends every process the
// example started, so nothing outlives a run and no PID is looked up after the fact.
const k32 =
  process.platform === "win32"
    ? dlopen("kernel32.dll", {
        CreateJobObjectW: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.ptr },
        SetInformationJobObject: { args: [FFIType.ptr, FFIType.i32, FFIType.ptr, FFIType.u32], returns: FFIType.i32 },
        OpenProcess: { args: [FFIType.u32, FFIType.i32, FFIType.u32], returns: FFIType.ptr },
        AssignProcessToJobObject: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.i32 },
        TerminateJobObject: { args: [FFIType.ptr, FFIType.u32], returns: FFIType.i32 },
        CloseHandle: { args: [FFIType.ptr], returns: FFIType.i32 },
      }).symbols
    : null;
const JobObjectExtendedLimitInformation = 9, KILL_ON_JOB_CLOSE = 0x2000, PROCESS_SET_QUOTA = 0x0100, PROCESS_TERMINATE = 0x0001;
export function jobFor(pid: number) {
  if (!k32) return null;
  const job = k32.CreateJobObjectW(null, null);
  if (!job) return null;
  // JOBOBJECT_EXTENDED_LIMIT_INFORMATION is 144 bytes on 64-bit Windows; LimitFlags is at offset 16
  const info = new Uint8Array(144);
  new DataView(info.buffer).setUint32(16, KILL_ON_JOB_CLOSE, true);
  const limited = k32.SetInformationJobObject(job, JobObjectExtendedLimitInformation, info, info.byteLength) !== 0;
  const proc = k32.OpenProcess(PROCESS_SET_QUOTA | PROCESS_TERMINATE, 0, pid);
  const assigned = !!proc && k32.AssignProcessToJobObject(job, proc) !== 0;
  if (proc) k32.CloseHandle(proc);
  return { limited, assigned, kill: () => k32.TerminateJobObject(job, 1), close: () => k32.CloseHandle(job) };
}

const extOf = (lang: string) => ({ typescript: "ts", javascript: "js" })[lang] ?? lang;
const clip = (s: string) => (s.length > 64_000 ? `${s.slice(0, 64_000)}\n[truncated]` : s);

// The named files of a page (`db.ts`, `package.json`, `index.html`, ...) are written before an example runs, as a
// reader following the page has them at that point: the last version defined before the example, otherwise the
// first one defined after it. Scripts are instrumented; other files are kept as they are.
async function materialize(dir: string, page: Snip[], current: number) {
  const byFile = Map.groupBy(page.filter((b) => b.file && !isAbsolute(b.file) && !b.file.split(/[\\/]/).includes("..")), (b) => b.file!);
  for (const [file, versions] of byFile) {
    const pick = versions.filter((b) => b.id < current).at(-1) ?? versions.find((b) => b.id > current);
    if (!pick) continue;
    const path = join(dir, file);
    mkdirSync(dirname(path), { recursive: true });
    const cov = relative(dirname(path), join(dir, ".cov")).replaceAll("\\", "/");
    await Bun.write(path, pick.run === "script" || pick.run === "test" ? instrument(pick.code, cov.startsWith(".") ? cov : `./${cov}`) : pick.code);
  }
}

export async function run(skill: string, s: Snip, timeoutMs = 10_000, page: Snip[] = []): Promise<Run> {
  const at = new Date().toISOString();
  const base = { skill, id: s.id, at, apis: [] as string[] };
  if (!s.run) return { ...base, status: "skipped", exit: null, ms: 0, stdout: "", stderr: "", reason: `not runnable (${s.lang || "plain"})` };
  if ((s.run === "shell" && outside.test(s.code)) || (s.run !== "shell" && outsideScript.test(s.code))) {
    const r: Run = { ...base, status: "skipped", exit: null, ms: 0, stdout: "", stderr: "", reason: "acts outside the working directory (global install, upgrade, publish, trust, login, shell config, credential store, clipboard, editor)" };
    persist(r);
    return r;
  }
  // one directory per page: shell examples build on each other (init, add, run)
  const dir = join(runsDir, skill);
  mkdirSync(join(dir, ".cov"), { recursive: true });
  // the page directory is its own package root, and `node` there is an alias of bun
  if (!existsSync(join(dir, "package.json"))) await Bun.write(join(dir, "package.json"), `${JSON.stringify({ name: `sandbox-${skill}`, private: true })}\n`);
  if (!existsSync(join(dir, "bunfig.toml"))) await Bun.write(join(dir, "bunfig.toml"), "[run]\nbun = true\n");
  await Bun.write(join(dir, ".cov", "cov.js"), recorder);
  for (const [m, src] of Object.entries(shims)) if (src) await Bun.write(join(dir, ".cov", shimFile(m)), src);
  await materialize(dir, page, s.id);
  const cov = join(dir, ".cov", `seen-${s.id}.ndjson`);
  rmSync(cov, { force: true });
  const exe = process.execPath;
  let cmd: string[];
  if (s.run === "shell") {
    const lines = s.code.split("\n").map((l) => l.replace(/^\s*\$\s+/, "")).filter((l) => /^\s*bunx?\s/.test(l));
    const script = lines.map((l) => l.replace(/^\s*bunx\s/, `"${exe}" x `).replace(/^\s*bun\s/, `"${exe}" `)).join("\n");
    cmd = [exe, "exec", script];
  } else {
    const name = s.file && !s.file.includes("/") ? s.file : `snippet.${extOf(s.lang)}`;
    const file = s.run === "test" && !/\.(test|spec)\.\w+$/.test(name) ? name.replace(/\.(\w+)$/, ".test.$1") : name;
    await Bun.write(join(dir, file), instrument(s.code));
    cmd = s.run === "test" ? [exe, "test", `./${file}`] : [exe, "run", `./${file}`];
  }
  const t0 = performance.now();
  const p = Bun.spawn(confine(cmd, dir), { cwd: dir, env: env(dir, cov), stdin: "ignore", stdout: "pipe", stderr: "pipe", detached: process.platform !== "win32" });
  const job = jobFor(p.pid);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    if (job?.assigned) job.kill();
    else
      try {
        process.kill(-p.pid, "SIGKILL");
      } catch {
        p.kill("SIGKILL");
      }
  }, timeoutMs);
  const [stdout, stderr, exit] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
  clearTimeout(timer);
  job?.close();
  const ms = performance.now() - t0;
  const apis = [...new Set((await Bun.file(cov).text().catch(() => "")).split("\n").filter(Boolean).map((l) => JSON.parse(l) as string))];
  // a server example keeps serving until it is stopped: reaching the timeout after starting one is its success
  const serving = apis.some((a) => /^Bun\.(?:serve|listen)\(\)$/.test(a)) && !stderr.trim();
  const status: Status = timedOut ? (serving ? "serving" : "timeout") : exit === 0 ? "pass" : "fail";
  const r: Run = { ...base, status, exit, ms, stdout: clip(stdout), stderr: clip(stderr), apis, at };
  persist(r);
  return r;
}

// A page's working directory goes once its examples have run (results stay in the database). Free space is kept
// above max(2 GiB, 5% of the file system): below it the shared package cache is dropped first, then the run stops.
export function cleanPage(skill: string) {
  rmSync(join(runsDir, skill), { recursive: true, force: true });
}
export function ensureSpace() {
  const free = () => { const s = statfsSync(dataDir); return { avail: s.bavail * s.bsize, total: s.blocks * s.bsize }; };
  const floor = (t: number) => Math.max(2 ** 31, t * 0.05);
  let f = free();
  if (f.avail >= floor(f.total)) return;
  rmSync(cacheDir, { recursive: true, force: true });
  mkdirSync(cacheDir, { recursive: true });
  f = free();
  if (f.avail < floor(f.total)) throw new Error(`not enough free space under ${dataDir}: ${Math.round(f.avail / 2 ** 20)} MiB`);
}
export const done = () => new Set((db.query("SELECT skill || '#' || id AS k FROM runs").all() as { k: string }[]).map((x) => x.k));

function persist(r: Run) {
  save.run({ skill: r.skill, id: r.id, status: r.status, exit: r.exit, ms: r.ms, stdout: r.stdout, stderr: r.stderr, apis: JSON.stringify(r.apis), reason: r.reason ?? null, at: r.at });
}
