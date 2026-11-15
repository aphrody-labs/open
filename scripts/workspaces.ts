// Generates the root workspaces object (package.json) and docs/workspaces.md.
// Usage: bun scripts/workspaces.ts [--write]
import { relative, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const BASES = ["packages", "crates", "extra", "ecosystem"];
const DEFAULT_CATALOG_REPO = "packages/opencode";
// Non-JS or non-installable dirs that exist as package.json (templates, fixtures, build output).
const JUNK = ["**/node_modules/**", "**/templates/**", "**/template/**", "**/fixtures/**", "**/fixture/**", "**/expected/**", "**/presets/**", "**/.output/**", "**/ecosystem-tests/**", "**/dist/**", "**/target/**"];
// Manual exclusions: path -> reason (archived, install-breaking, or deliberate).
const MANUAL: Record<string, string> = JSON.parse(await Bun.file(`${ROOT}/scripts/workspaces.exclude.json`).text().catch(() => "{}"));

const scan = async (pat: string) => {
  const out: string[] = [];
  for await (const f of new Bun.Glob(pat).scan({ cwd: ROOT, dot: true })) if (!f.includes("node_modules/")) out.push(f);
  return out;
};
const pkgFiles = (await scan("**/package.json")).filter((f) => BASES.some((b) => f.startsWith(b + "/")));
const dirOf = (f: string) => f.replace(/\/package\.json$/, "");
const pkgs = new Map<string, any>();
for (const f of pkgFiles) {
  const j = await Bun.file(`${ROOT}/${f}`).json().catch(() => null);
  if (j) pkgs.set(dirOf(f), j);
}

// Repos = direct children of the bases.
const repos: string[] = [];
for (const b of BASES) for await (const d of new Bun.Glob("*/").scan({ cwd: `${ROOT}/${b}`, onlyFiles: false })) repos.push(`${b}/${d.replace(/\/$/, "")}`);

const includes = new Set<string>(BASES.map((b) => `${b}/*`));
const excludes = new Set<string>(JUNK);
const catalogs: Record<string, Record<string, string>> = {};
let defaultCatalog: Record<string, string> = {};
const catalogRepos = new Map<string, string>(); // repo path -> catalog prefix name

const norm = (r: string, p: string) => {
  const neg = p.startsWith("!");
  const q = (neg ? p.slice(1) : p).replace(/^\.\//, "").replace(/\/$/, "");
  return { neg, path: `${r}/${q}` };
};
for (const r of repos) {
  const pj = pkgs.get(r);
  let pats: string[] = [];
  let cat: any, cats: any;
  if (pj?.workspaces) {
    pats.push(...(Array.isArray(pj.workspaces) ? pj.workspaces : pj.workspaces.packages ?? []));
    cat = pj.workspaces.catalog; cats = pj.workspaces.catalogs;
  }
  cat ??= pj?.catalog; cats ??= pj?.catalogs;
  const yf = Bun.file(`${ROOT}/${r}/pnpm-workspace.yaml`);
  if (await yf.exists()) {
    const y: any = (Bun as any).YAML.parse(await yf.text());
    pats.push(...(y.packages ?? []));
    cat ??= y.catalog; cats ??= y.catalogs;
  }
  const lf = Bun.file(`${ROOT}/${r}/lerna.json`);
  if (await lf.exists()) pats.push(...((await lf.json()).packages ?? []));
  for (const p of pats) {
    const { neg, path } = norm(r, p);
    (neg ? excludes : includes).add(path);
  }
  const name = basename(r);
  if (cat || cats) {
    if (r === DEFAULT_CATALOG_REPO) {
      defaultCatalog = { ...(cat ?? {}) };
      for (const [k, v] of Object.entries(cats ?? {})) catalogs[`${name}-${k}`] = v as any;
      catalogRepos.set(r, "");
    } else {
      if (cat) catalogs[name] = cat;
      for (const [k, v] of Object.entries(cats ?? {})) catalogs[`${name}-${k}`] = v as any;
      catalogRepos.set(r, name);
    }
  }
}
for (const k of Object.keys(MANUAL)) excludes.add(k);

const match = (pats: Iterable<string>, d: string) => [...pats].some((p) => new Bun.Glob(p).match(d));
// Drop declared patterns that match no package.json (bun fails on missing explicit workspace dirs).
for (const p of [...includes]) if (![...pkgs.keys()].some((d) => new Bun.Glob(p).match(d))) includes.delete(p);
let members = [...pkgs.keys()].filter((d) => match(includes, d) && !match(excludes, d));
const reasons: { path: string; name?: string; reason: string }[] = [];
for (const d of [...pkgs.keys()]) if (match(includes, d) && match(Object.keys(MANUAL), d)) reasons.push({ path: d, name: pkgs.get(d).name, reason: MANUAL[Object.keys(MANUAL).find((k) => new Bun.Glob(k).match(d))!] });
for (const d of [...pkgs.keys()]) if (match(includes, d) && !match(Object.keys(MANUAL), d) && match(JUNK, d)) reasons.push({ path: d, name: pkgs.get(d).name, reason: "template, fixture, or build output (not a real package)" });
const noName = members.filter((d) => !pkgs.get(d).name);
for (const d of noName) reasons.push({ path: d, reason: "no package name" });
members = members.filter((d) => pkgs.get(d).name);
const validName = /^(@[a-z0-9._~-]+\/)?[a-z0-9._~-]+$/i;
for (const d of members.filter((d) => !validName.test(pkgs.get(d).name))) { reasons.push({ path: d, name: pkgs.get(d).name, reason: "invalid npm package name (bun cannot resolve it); its child packages stay members" }); excludes.add(d); }
members = members.filter((d) => validName.test(pkgs.get(d).name));

// Duplicate names: keep the best-ranked path.
const score = (d: string) => d.split("/").length * 10 + (/\bbeta\b|-beta/.test(d) ? 500 : 0) + (/examples?\//.test(d) ? 200 : 0) + (d.startsWith("packages/") ? 0 : d.startsWith("crates/") ? 1 : d.startsWith("ecosystem/") ? 2 : 3);
const byName = new Map<string, string[]>();
for (const d of members) { const n = pkgs.get(d).name; byName.set(n, [...(byName.get(n) ?? []), d]); }
const dupExcl: string[] = [];
for (const [n, ds] of byName) {
  if (ds.length < 2) continue;
  ds.sort((a, b) => score(a) - score(b));
  for (const x of ds.slice(1)) { dupExcl.push(x); reasons.push({ path: x, name: n, reason: `duplicate package name "${n}"; kept ${ds[0]}` }); }
}
members = members.filter((d) => !dupExcl.includes(d));

// Rewrite catalog: refs in repos with named catalogs.
let rewritten = 0;
const WRITE = process.argv.includes("--write");
for (const [r, pre] of catalogRepos) {
  if (pre === "") continue;
  for (const d of members.filter((m) => m === r || m.startsWith(r + "/"))) {
    const f = `${ROOT}/${d}/package.json`;
    const t = await Bun.file(f).text();
    const n = t.replace(/"catalog:([^"]*)"/g, (m, v) => (v === pre || v.startsWith(pre + "-") ? m : `"catalog:${v ? `${pre}-${v}` : pre}"`));
    if (n !== t) { rewritten++; if (WRITE) await Bun.write(f, n); }
  }
}

// bun adds explicit (non-glob) paths directly, so "!" cannot remove them: drop those includes.
for (const p of [...includes]) if (!/[*?\[{]/.test(p) && (dupExcl.includes(p) || match(excludes, p))) includes.delete(p);
const finalExcl =[...excludes].filter((e) => !JUNK.includes(e) || true);
const wsObj: any = {
  packages: [...includes, ...[...finalExcl].map((e) => "!" + e), ...dupExcl.map((e) => "!" + e)],
  catalog: defaultCatalog,
  catalogs,
};
const rootPkg = {
  name: "@aphrody/open",
  private: true,
  type: "module",
  workspaces: wsObj,
  scripts: { aot: "bun scripts/aot.ts", "test-ts": "bun scripts/test-ts.ts", workspaces: "bun scripts/workspaces.ts --write" },
};
console.log(JSON.stringify({ includes: includes.size, excludes: finalExcl.length, members: members.length, dups: dupExcl.length, noName: noName.length, catalogs: Object.keys(catalogs), rewritten }));
if (WRITE) {
  await Bun.write(`${ROOT}/package.json`, JSON.stringify(rootPkg, null, 2) + "\n");
  await Bun.write(`${ROOT}/scripts/workspaces.members.json`, JSON.stringify(members.sort(), null, 1) + "\n");
  const md = [
    "# Workspaces",
    "",
    `Generated by \`bun scripts/workspaces.ts --write\`. ${members.length} members, declared as globs in the root \`package.json\`.`,
    "",
    "Sources: `packages/*`, `crates/*`, `extra/*`, `ecosystem/*` plus every nested workspace glob of each imported repo (package.json `workspaces`, `pnpm-workspace.yaml`, `lerna.json`); `!` patterns are carried over.",
    "",
    "Catalogs: the opencode `catalog` is the root default; every other repo's `catalog`/`catalogs` become named catalogs (`<repo>` or `<repo>-<name>`) and the `catalog:` references of that repo's members are rewritten to match (" + rewritten + " package.json files edited).",
    "",
    "## Excluded",
    "",
    "| Path | Name | Reason |",
    "|---|---|---|",
    ...reasons.sort((a, b) => a.path.localeCompare(b.path)).map((x) => `| ${x.path} | ${x.name ?? ""} | ${x.reason} |`),
    "",
  ].join("\n");
  await Bun.write(`${ROOT}/docs/workspaces.md`, md);
}
