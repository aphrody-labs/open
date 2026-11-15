// Reproducible import of upstream repos into this monorepo.
// Usage: bun scripts/sync.ts [--update] [--only name,name] [--root DIR] [--scratch DIR]
//   default: re-export every entry of open.lock.json at its pinned `rev`.
//   --update: ignore pinned rev, take the upstream default branch HEAD, rewrite the lock.
//   entries without `rev` (seed) are resolved like --update.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, lstatSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(n);
const opt = (n: string, d: string) => (argv.includes(n) ? argv[argv.indexOf(n) + 1]! : d);
const ROOT = resolve(opt("--root", join(import.meta.dir, "..")));
const SCRATCH = resolve(opt("--scratch", "/srv/open-src"));
const ONLY = opt("--only", "").split(",").filter(Boolean);
const MAX = 50 * 1024 * 1024;
// Characters and names Windows refuses in a path component: such files would make the repository uncloneable there.
const WINDOWS_INVALID = /[:*?"<>|]|(^|\/)(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.[^/]*)?$|[ .](\/|$)/i;
const LOCK = join(ROOT, "open.lock.json");

type Entry = {
  name: string; url: string; rev?: string; path: string; language: string;
  archived: boolean; fork: boolean; license?: string; dropped_files?: { path: string; bytes: number; reason?: "size" | "windows-name" }[];
  submodules?: { path: string; url: string }[];
};

async function run(cmd: string[], opts: { cwd?: string; shell?: boolean } = {}) {
  const p = Bun.spawn(opts.shell ? ["bash", "-c", cmd.join(" ")] : cmd, { cwd: opts.cwd, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
  if (code !== 0) throw new Error(`${cmd.join(" ")} -> ${code}: ${err.trim().slice(0, 400)}`);
  return out.trim();
}

function walk(dir: string, out: string[] = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    const st = lstatSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (st.isFile()) out.push(p);
  }
  return out;
}

function spdx(text: string): string | undefined {
  const t = text.toLowerCase();
  if (t.includes("apache license") && t.includes("version 2.0")) return "Apache-2.0";
  if (t.includes("permission is hereby granted, free of charge")) return "MIT";
  if (t.includes("gnu affero general public")) return "AGPL-3.0";
  if (t.includes("gnu lesser general public")) return "LGPL-3.0";
  if (t.includes("gnu general public license") && t.includes("version 3")) return "GPL-3.0";
  if (t.includes("gnu general public license") && t.includes("version 2")) return "GPL-2.0";
  if (t.includes("mozilla public license") && t.includes("2.0")) return "MPL-2.0";
  if (t.includes("redistribution and use in source and binary forms")) return t.includes("neither the name") ? "BSD-3-Clause" : "BSD-2-Clause";
  if (t.includes("this is free and unencumbered software")) return "Unlicense";
  if (t.includes("isc license") || t.includes("permission to use, copy, modify, and/or distribute")) return "ISC";
  return undefined;
}

async function licenseOf(e: Entry, dest: string): Promise<string> {
  const lic = readdirSync(dest).find((n) => /^(licen[sc]e|copying)(\.|$)/i.test(n));
  if (lic) {
    const s = spdx(readFileSync(join(dest, lic), "utf8"));
    if (s) return s;
  }
  try {
    const slug = new URL(e.url).pathname.replace(/^\/|\.git$/g, "");
    const id = await run(["gh", "api", `repos/${slug}/license`, "-q", ".license.spdx_id"]);
    if (id && id !== "null") return id;
  } catch {}
  return lic ? "NOASSERTION" : "NONE";
}

async function importOne(e: Entry, update: boolean) {
  const scratch = join(SCRATCH, e.path.replaceAll("/", "__"));
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  if (e.rev && !update) {
    await run(["git", "init", "-q", scratch]);
    await run(["git", "-C", scratch, "fetch", "-q", "--depth", "1", e.url, e.rev]);
    await run(["git", "-C", scratch, "checkout", "-q", "FETCH_HEAD"]);
  } else {
    await run(["git", "clone", "-q", "--depth", "1", e.url, scratch]);
  }
  e.rev = await run(["git", "-C", scratch, "rev-parse", "HEAD"]);
  const dest = join(ROOT, e.path);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  await run([`git -C '${scratch}' archive HEAD | tar -x -C '${dest}'`], { shell: true });
  e.submodules = [];
  if (existsSync(join(scratch, ".gitmodules"))) {
    const raw = await run(["git", "config", "-f", join(scratch, ".gitmodules"), "--get-regexp", "^submodule\\..*\\.(path|url)$"]).catch(() => "");
    const m = new Map<string, { path?: string; url?: string }>();
    for (const l of raw.split("\n").filter(Boolean)) {
      const [k, ...v] = l.split(" ");
      const mm = /^submodule\.(.*)\.(path|url)$/.exec(k!);
      if (!mm) continue;
      const o = m.get(mm[1]!) ?? {};
      (o as any)[mm[2]!] = v.join(" ");
      m.set(mm[1]!, o);
    }
    e.submodules = [...m.values()].filter((o) => o.path && o.url) as { path: string; url: string }[];
  }
  e.dropped_files = [];
  for (const f of walk(dest)) {
    const sz = statSync(f).size;
    const rel = relative(ROOT, f).replaceAll("\\", "/");
    const reason = sz > MAX ? "size" : WINDOWS_INVALID.test(rel) ? "windows-name" : null;
    if (reason) {
      e.dropped_files.push({ path: rel, bytes: sz, reason });
      rmSync(f);
    }
  }
  e.license = await licenseOf(e, dest);
  rmSync(scratch, { recursive: true, force: true });
  return e;
}

const lock: Entry[] = JSON.parse(readFileSync(LOCK, "utf8"));
const update = flag("--update");
const todo = lock.filter((e) => !ONLY.length || ONLY.includes(e.name));
const failed: string[] = [];
let i = 0;
async function worker() {
  while (i < todo.length) {
    const e = todo[i++]!;
    try {
      await importOne(e, update);
      console.log(`ok ${e.path} ${e.rev!.slice(0, 10)} ${e.license} dropped=${e.dropped_files!.length} sub=${e.submodules!.length}`);
    } catch (err) {
      failed.push(e.name);
      console.error(`FAIL ${e.name}: ${(err as Error).message}`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
writeFileSync(LOCK, JSON.stringify(lock, null, 2) + "\n");
if (failed.length) {
  console.error(`failed: ${failed.join(",")}`);
  process.exitCode = 1;
}
