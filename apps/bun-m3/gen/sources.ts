// Sources of the deliverable: a sparse, shallow checkout of the Bun fork (docs and bun-types) in .cache/bun-fork at the
// revision pinned in sources.json, so a regeneration reads the same pages. --update moves the pin to the head of the
// default branch. The cache is this script's own directory.
// bun gen/sources.ts [--update] [--repo <owner/name>]
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const argv = Bun.argv.slice(2);
const pinFile = join(import.meta.dir, "../sources.json");
const pinned = existsSync(pinFile) ? await Bun.file(pinFile).json() : null;
const update = argv.includes("--update") || !pinned?.rev;
const repo = argv.includes("--repo") ? argv[argv.indexOf("--repo") + 1]! : (pinned?.repo ?? "aphrody-labs/bun");
const dir = join(import.meta.dir, "../../../.cache/bun-fork");
const git = (...args: string[]) => {
  const r = Bun.spawnSync(["git", ...args], { stdout: "pipe", stderr: "pipe" });
  if (r.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr.toString()}`);
  return r.stdout.toString().trim();
};
if (!existsSync(join(dir, ".git"))) {
  mkdirSync(dir, { recursive: true });
  git("clone", "--depth", "1", "--filter=blob:none", "--sparse", `https://github.com/${repo}.git`, dir);
}
git("-C", dir, "fetch", "--depth", "1", "origin", update ? "HEAD" : pinned.rev);
git("-C", dir, "checkout", "--force", "--detach", "FETCH_HEAD");
git("-C", dir, "sparse-checkout", "set", "docs", "packages/bun-types");
const branch = update ? git("-C", dir, "symbolic-ref", "--short", "refs/remotes/origin/HEAD").replace(/^origin\//, "") : pinned.branch;
const meta = { repo, branch, rev: git("-C", dir, "rev-parse", "HEAD"), web: `https://github.com/${repo}` };
if (update) await Bun.write(pinFile, `${JSON.stringify(meta, null, 2)}\n`);
console.log(JSON.stringify(meta));
