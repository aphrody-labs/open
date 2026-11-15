// AOT: compile every workspace CLI to a standalone executable with bun.
// Usage: bun scripts/aot.ts [--only a,b] [--targets bun-linux-x64,...] [--list]
// Output: dist/<name>-<os>-<arch>[.exe]
import { existsSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? (process.argv.includes(`--${k}`) ? process.argv[process.argv.indexOf(`--${k}`) + 1] : undefined);
const ALL_TARGETS = ["bun-linux-x64", "bun-linux-arm64", "bun-windows-x64", "bun-darwin-arm64"];
const targets = arg("targets")?.split(",") ?? ALL_TARGETS;
const only = arg("only")?.split(",");
const DIST = join(ROOT, "dist");
mkdirSync(DIST, { recursive: true });

const outName = (name: string, target: string) => {
  const [, os, arch] = target.split("-");
  return join(DIST, `${name}-${os}-${arch}`);
};
const finalPath = (name: string, target: string) => outName(name, target) + (target.includes("windows") ? ".exe" : "");

// Known CLIs whose own build script is the supported way to bundle (plugins, assets, defines).
const KNOWN: Record<string, { name: string; run: (dir: string, target: string) => Promise<string> }> = {
  "@opencode/cli": {
    name: "opencode",
    run: async (dir, target) => {
      const [, os, arch] = target.split("-");
      const t = `${os}-${arch}`; // opencode names windows targets "windows"
      const outdir = join(ROOT, "dist", ".opencode-build");
      const p = Bun.spawn(["bun", "run", "script/build.ts", "--skip-install", `--outdir=${outdir}`], {
        cwd: dir,
        env: { ...process.env, OPENCODE_TARGET: t },
        stdout: "inherit",
        stderr: "inherit",
      });
      if ((await p.exited) !== 0) throw new Error(`opencode build failed for ${t}`);
      return join(outdir, `cli-${t}`, "bin", `opencode${os === "windows" ? ".exe" : ""}`);
    },
  },
};

const members: string[] = await Bun.file(join(ROOT, "scripts/workspaces.members.json")).json();
type Job = { dir: string; pkg: string; name: string; entry?: string };
const jobs: Job[] = [];
for (const m of members) {
  const dir = join(ROOT, m);
  const j = await Bun.file(join(dir, "package.json")).json();
  if (!j.bin) continue;
  const bins: Record<string, string> = typeof j.bin === "string" ? { [(j.name as string).split("/").pop()!]: j.bin } : j.bin;
  if (KNOWN[j.name]) {
    jobs.push({ dir, pkg: j.name, name: KNOWN[j.name].name });
    continue;
  }
  for (const [name, rel] of Object.entries(bins)) {
    const cands = [rel, rel.replace(/^\.?\/?dist\//, "src/").replace(/\.(m?js|cjs)$/, ".ts"), "src/index.ts", "src/cli.ts"].map((c) => join(dir, c));
    const entry = cands.find((c) => /\.(ts|tsx|js|mjs|cjs)$/.test(c) && existsSync(c));
    if (!entry) { console.log(`skip ${j.name}:${name} (no JS entry for ${rel})`); continue; }
    jobs.push({ dir, pkg: j.name, name, entry });
  }
}
const sel = jobs.filter((j) => !only || only.includes(j.name));
if (process.argv.includes("--list")) {
  for (const j of sel) console.log(j.name, j.pkg, j.entry ?? "(known build script)");
  process.exit(0);
}

let ok = 0, fail = 0;
for (const j of sel) {
  for (const t of targets) {
    const out = finalPath(j.name, t);
    try {
      if (KNOWN[j.pkg]) {
        const built = await KNOWN[j.pkg].run(j.dir, t);
        copyFileSync(built, out);
      } else {
        const p = Bun.spawn(["bun", "build", "--compile", "--bytecode", "--minify", `--target=${t}`, j.entry!, "--outfile", outName(j.name, t)], { cwd: j.dir, stdout: "inherit", stderr: "inherit" });
        if ((await p.exited) !== 0) throw new Error("bun build failed");
      }
      console.log(`ok ${basename(out)} ${statSync(out).size} bytes`);
      ok++;
    } catch (e) {
      console.error(`FAIL ${j.name} ${t}: ${e}`);
      fail++;
    }
  }
}
console.log(`aot: ${ok} built, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
