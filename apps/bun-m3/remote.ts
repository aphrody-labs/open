// Reference run on a fleet host. Nothing about the host is written here:
//   - the host is the first node of the fleet file whose role is --role ([nodes.*] tables with `role` and
//     `ssh_alias`; the Aphrody monorepo's infra/deploy.toml has that shape), reached with `ssh <ssh_alias>`;
//   - Bun is the canary from the host's runtime manager (`ay rt install bun@canary`, `ay rt run bun@canary`);
//   - the code is this repository's `origin` at the local HEAD, checked out sparsely (this app only) in the
//     host user's state directory; the run data stays in the runner's default state directory there;
//   - the server runs as a systemd user unit on a free port, and the coverage report comes back to coverage.json.
// bun remote.ts --fleet <deploy.toml> --role <role> [--resume] [--keep]
import { join, relative } from "node:path";
import { parseArgs } from "node:util";

const { values: a } = parseArgs({ options: { fleet: { type: "string" }, role: { type: "string" }, resume: { type: "boolean", default: false }, keep: { type: "boolean", default: false } } });
if (!a.fleet || !a.role) throw new Error("usage: bun remote.ts --fleet <deploy.toml> --role <role> [--resume] [--keep]");
const fleet = Bun.TOML.parse(await Bun.file(a.fleet).text()) as { nodes?: Record<string, { role?: string; ssh_alias?: string }> };
const [name, node] = Object.entries(fleet.nodes ?? {}).find(([, n]) => n.role === a.role) ?? [];
if (!node?.ssh_alias) throw new Error(`no node with role "${a.role}" and an ssh_alias in ${a.fleet}`);

const app = import.meta.dir;
const local = (...args: string[]) => Bun.spawnSync(["git", "-C", app, ...args], { stdout: "pipe" }).stdout.toString().trim();
const origin = local("remote", "get-url", "origin");
const rev = local("rev-parse", "HEAD");
const sub = relative(local("rev-parse", "--show-toplevel"), app).replaceAll("\\", "/");
if (local("status", "--porcelain", "--", ".")) console.warn("local changes in this app are not on the host: it runs HEAD", rev);

async function ssh(script: string, timeoutMs: number): Promise<string> {
  const p = Bun.spawn(["ssh", node!.ssh_alias!, "bash", "-se"], { stdin: new TextEncoder().encode(script), stdout: "pipe", stderr: "pipe", timeout: timeoutMs });
  const [out, err, code] = await Promise.all([new Response(p.stdout).text(), new Response(p.stderr).text(), p.exited]);
  if (code !== 0) throw new Error(`ssh ${node!.ssh_alias} exited ${code}: ${err.slice(-2000)}`);
  return out;
}

const q = (s: string) => `'${s.replaceAll("'", `'\\''`)}'`;
const repoDir = `"\${XDG_STATE_HOME:-$HOME/.local/state}/bun-m3-src"`;
console.log(`host ${name} (${node.ssh_alias}), role ${a.role}, ${origin} @ ${rev.slice(0, 9)}`);
const port = (
  await ssh(
    `
dir=${repoDir}
if [ ! -d "$dir/.git" ]; then git clone -q --filter=blob:none --sparse ${q(origin)} "$dir"; fi
cd "$dir"
git sparse-checkout set ${q(sub)}
git fetch -q origin ${q(rev)} && git reset -q --hard ${q(rev)}
ay rt install bun@canary >/dev/null
cd ${q(sub)}
bun() { ay rt run bun@canary -- "$@"; }
bun install --silent
bun gen/sources.ts >/dev/null && bun gen/skills.ts >/dev/null && bun gen/pages.ts >/dev/null && bun gen/reference.ts >/dev/null && bun gen/api.ts >/dev/null
bun build.ts >/dev/null
systemctl --user stop bun-m3 2>/dev/null || true
systemctl --user reset-failed bun-m3 2>/dev/null || true
since=$(date +%s)
systemd-run --user --unit bun-m3 --working-directory="$PWD" "$PWD/dist/bun-m3" --port 0 >/dev/null
for i in $(seq 1 120); do
  url=$(journalctl --user -u bun-m3 --since "@$since" -o cat | grep -o 'http://[^ ]*' | tail -1)
  [ -n "$url" ] && curl -sf "\${url}api/theme" >/dev/null && { echo "$url" | grep -o '[0-9]*/$' | tr -d /; exit 0; }
  sleep 1
done
exit 1
`,
    1_800_000,
  )
).trim();
console.log(`server on port ${port}`);
const base = `http://127.0.0.1:${port}`;
console.log(await ssh(`curl -s -X POST ${q(`${base}/api/run-all${a.resume ? "?resume" : ""}`)}`, 60_000));
// wait until the run is finished or stopped (free-space guard), then bring the report back
await ssh(
  `while :; do
  s=$(curl -s ${q(`${base}/api/run-all`)})
  t=$(echo "$s" | grep -o '"total":[0-9]*' | cut -d: -f2); d=$(echo "$s" | grep -o '"done":[0-9]*' | cut -d: -f2)
  if [ -n "$t" ] && [ "$t" = "$d" ]; then break; fi
  if echo "$s" | grep -q '"stopped"'; then echo "$s" >&2; exit 1; fi
  systemctl --user is-active -q bun-m3 || exit 1
  sleep 20
done`,
  6 * 3_600_000,
);
const coverage = await ssh(`curl -s ${q(`${base}/api/coverage`)}`, 120_000);
JSON.parse(coverage);
await Bun.write(join(app, "coverage.json"), coverage);
if (!a.keep) await ssh("systemctl --user stop bun-m3", 60_000);
const c = JSON.parse(coverage);
console.log(JSON.stringify({ host: name, runs: c.runs, bun: { used: c.bun.used, total: c.bun.total, revision: c.bun.revision } }));
