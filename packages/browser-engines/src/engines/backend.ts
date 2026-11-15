// SPDX-License-Identifier: Apache-2.0
/**
 * C++ backend selection for `ay`, with no list of its own: candidates, channels, JS engine and
 * WebGPU backend all come from the engines registry (registry.ts, whose Chrome channels follow
 * Chrome for Testing). A request is a set of needs (`--need cdp,webgpu`, `--js v8`,
 * `--channel canary`); the first registry engine meeting them that is installed wins, else the
 * first installable one. Order: explicit id, AY_BACKEND, `.engine-version`, needs, project
 * detection (a dependency that the registry lists as an npm automation library means `cdp`),
 * and with no need at all the running Bun (JavaScriptCore).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { installEngines } from "./install.ts";
import { ENGINES, type Engine, getEngine, resolveExecutable } from "./registry.ts";

export interface Needs {
  protocol?: Engine["protocol"];
  js?: Engine["js"];
  gpu?: Engine["gpu"];
  channel?: string;
}

/** Engines that are a runnable C++ backend: a JS engine library or a browser speaking a protocol. */
const runnable = (e: Engine) => e.role === "js-engine" || (e.protocol !== "library" && e.js !== "none");

const channelOf = (e: Engine) => ("channel" in e.install ? e.install.channel : undefined);

export function matches(e: Engine, n: Needs): boolean {
  return (
    runnable(e) &&
    (!n.protocol || e.protocol === n.protocol) &&
    (!n.js || e.js === n.js) &&
    (!n.gpu || e.gpu === n.gpu) &&
    (!n.channel || channelOf(e) === n.channel)
  );
}

/** Needs inferred from package.json: a dependency the registry knows as an automation library. */
export function detectNeeds(dir: string): Needs {
  try {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const libs = ENGINES.flatMap((e) => (e.install.via === "dependency" && e.install.registry === "npm" ? [e.install.name] : []));
    if (libs.some((l) => l in deps)) return { protocol: "cdp" };
  } catch {}
  return {};
}

/** The running Bun is the JavaScriptCore backend; other engines resolve through the registry. */
export function executable(e: Engine): string | null {
  return e.id === "javascriptcore" ? Bun.env.BUN_PATH || process.execPath : resolveExecutable(e);
}

export interface Pick {
  engine: Engine;
  from: string;
}

export function pickBackend(
  opts: { id?: string; needs?: Needs; dir?: string; env?: Record<string, string | undefined> } = {},
): Pick {
  const env = opts.env ?? Bun.env;
  const dir = opts.dir ?? process.cwd();
  if (opts.id) return { engine: getEngine(opts.id), from: "argument" };
  if (env.AY_BACKEND) return { engine: getEngine(env.AY_BACKEND), from: "AY_BACKEND" };
  const file = join(dir, ".engine-version");
  const pinned = existsSync(file) ? ENGINES.find((e) => e.id === readFileSync(file, "utf8").trim()) : undefined;
  if (pinned && runnable(pinned)) return { engine: pinned, from: ".engine-version" };
  const asked = opts.needs && Object.values(opts.needs).some(Boolean);
  const needs = asked ? opts.needs! : detectNeeds(dir);
  if (!Object.values(needs).some(Boolean)) return { engine: getEngine("javascriptcore"), from: "default" };
  const all = ENGINES.filter((e) => matches(e, needs));
  const engine = all.find((e) => executable(e)) ?? all.find((e) => e.install.via !== "build") ?? all[0];
  if (!engine) throw new Error(`no registry engine meets ${JSON.stringify(needs)}`);
  return { engine, from: asked ? "needs" : "detected" };
}

export async function useBackend(e: Engine, write: boolean, dir = process.cwd()): Promise<string> {
  let exe = executable(e);
  if (!exe) {
    const [r] = await installEngines([e.id]);
    if (!r?.ok) throw new Error(`install ${e.id}: ${r?.detail ?? "failed"}`);
    exe = r.path ?? executable(e);
  }
  if (!exe) throw new Error(`${e.id}: no executable`);
  if (write) writeFileSync(join(dir, ".engine-version"), `${e.id}\n`);
  return exe;
}

const flag = (args: string[], name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

export async function runBackendCommand(args: string[]): Promise<number> {
  const [sub = "pick", ...rest] = args;
  const json = rest.includes("--json");
  const valued = new Set(["--need", "--js", "--gpu", "--channel", "--dir"]);
  const id = rest.find((a, i) => !a.startsWith("--") && !valued.has(rest[i - 1] ?? ""));
  const need = flag(rest, "--need")?.split(",") ?? [];
  const needs: Needs = {
    protocol: need.find((n) => n !== "webgpu") as Needs["protocol"],
    gpu: (flag(rest, "--gpu") ?? (need.includes("webgpu") ? "dawn" : undefined)) as Needs["gpu"],
    js: flag(rest, "--js") as Needs["js"],
    channel: flag(rest, "--channel"),
  };
  const dir = flag(rest, "--dir");
  const row = (e: Engine) => ({ id: e.id, js: e.js, gpu: e.gpu, protocol: e.protocol, channel: channelOf(e) ?? "-", path: executable(e) ?? "-" });
  switch (sub) {
    case "list": {
      const rows = ENGINES.filter((e) => matches(e, needs)).map(row);
      if (json) console.log(JSON.stringify(rows, null, 2));
      else for (const r of rows) console.log(Object.values(r).join("\t"));
      return 0;
    }
    case "pick":
    case "use": {
      const p = pickBackend({ id, needs, dir });
      const exe = sub === "use" ? await useBackend(p.engine, rest.includes("--write"), dir) : executable(p.engine);
      const out = { ...row(p.engine), from: p.from, path: exe };
      console.log(json ? JSON.stringify(out) : `${out.id}\t${out.from}\t${exe ?? "not installed"}`);
      return exe ? 0 : 1;
    }
    default:
      console.error(
        "engines backend list|pick|use [id] [--need cdp|webdriver|webgpu] [--js v8|javascriptcore] [--channel <cft channel>] [--write] [--json]",
      );
      return 2;
  }
}
