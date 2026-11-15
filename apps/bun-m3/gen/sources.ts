// Sources of the deliverable: a sparse, shallow checkout of the Bun fork (docs and bun-types) in .cache/bun-fork
// at the head of its default branch. The cache is this script's own directory, so updating it resets it.
// bun gen/sources.ts [--repo <owner/name>]
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const argv = Bun.argv.slice(2);
const repo = argv.includes("--repo") ? argv[argv.indexOf("--repo") + 1]! : "aphrody-labs/bun";
const dir = join(import.meta.dir, "../../../.cache/bun-fork");
const git = (...args: string[]) => {
  const r = Bun.spawnSync(["git", ...args], { stdout: "pipe", stderr: "pipe" });
  if (r.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr.toString()}`);
  return r.stdout.toString().trim();
};
if (!existsSync(join(dir, ".git"))) {
  mkdirSync(dir, { recursive: true });
  git("clone", "--depth", "1", "--filter=blob:none", "--sparse", `https://github.com/${repo}.git`, dir);
} else {
  git("-C", dir, "fetch", "--depth", "1", "origin", "HEAD");
  git("-C", dir, "reset", "--hard", "FETCH_HEAD");
}
git("-C", dir, "sparse-checkout", "set", "docs", "packages/bun-types");
const branch = git("-C", dir, "symbolic-ref", "--short", "refs/remotes/origin/HEAD").replace(/^origin\//, "");
const meta = { repo, branch, rev: git("-C", dir, "rev-parse", "HEAD"), web: `https://github.com/${repo}` };
await Bun.write(join(import.meta.dir, "../sources.json"), `${JSON.stringify(meta, null, 2)}\n`);
console.log(JSON.stringify(meta));
