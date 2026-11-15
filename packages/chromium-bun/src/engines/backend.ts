// SPDX-License-Identifier: Apache-2.0
/**
 * C++ backend selection for `ay`: Bun's (JavaScriptCore + WebKit, oven-sh fork) or Chromium's
 * (V8 + Dawn + Skia) on the stable, beta, dev or canary channel, or the fr1 build of the repo.
 * A backend is a row of BACKENDS, a use case is a row of USE_CASES: adding either is one entry,
 * no code path changes. Resolution order: explicit id, AY_BACKEND, `.engine-version` holding a
 * backend id, the requested use case, project detection, then the `script` use case.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { installEngines } from "./install.ts";
import { getEngine, resolveExecutable } from "./registry.ts";

export type BackendId =
  | "bun"
  | "chromium@stable"
  | "chromium@beta"
  | "chromium@dev"
  | "chromium@canary"
  | "chromium@local";

export interface Backend {
  readonly id: BackendId;
  readonly js: "javascriptcore" | "v8";
  readonly gpu: "none" | "dawn";
  /** Registry engine that provides the executable (null: the bun runtime itself). */
  readonly engine: string | null;
}

export const BACKENDS: readonly Backend[] = [
  { id: "bun", js: "javascriptcore", gpu: "none", engine: null },
  ...(["stable", "beta", "dev", "canary"] as const).map(
    (c): Backend => ({ id: `chromium@${c}`, js: "v8", gpu: "dawn", engine: `chrome@${c}` }),
  ),
  { id: "chromium@local", js: "v8", gpu: "dawn", engine: "chromium" },
];

/** Use case -> backend, with the reason kept for `backend list`. */
export const USE_CASES: Readonly<Record<string, { backend: BackendId; why: string }>> = {
  script: { backend: "bun", why: "fast startup, Bun APIs, no browser" },
  test: { backend: "bun", why: "bun test, JSC" },
  server: { backend: "bun", why: "Bun.serve, low memory" },
  build: { backend: "bun", why: "bundler and transpiler" },
  render: { backend: "chromium@stable", why: "Blink layout and Skia, reference rendering" },
  automation: { backend: "chromium@stable", why: "CDP, Playwright and Puppeteer target" },
  webgpu: { backend: "chromium@stable", why: "Dawn WebGPU" },
  ci: { backend: "chromium@stable", why: "reproducible, Chrome for Testing pin" },
  preview: { backend: "chromium@dev", why: "next milestone features" },
  canary: { backend: "chromium@canary", why: "newest V8 and Blink, regression hunting" },
  fork: { backend: "chromium@local", why: "patched Chromium built on fr1" },
};

export const ENGINE_FILE = ".engine-version";
const BROWSER_DEPS = ["playwright", "playwright-core", "puppeteer", "puppeteer-core", "@playwright/test"];

export function getBackend(id: string): Backend {
  const b = BACKENDS.find((x) => x.id === id);
  if (!b) throw new Error(`unknown backend ${id} (${BACKENDS.map((x) => x.id).join(", ")})`);
  return b;
}

/** Use case inferred from the project: browser automation deps mean Chromium, otherwise Bun. */
export function detectUseCase(dir: string): string {
  try {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (BROWSER_DEPS.some((d) => d in deps)) return "automation";
  } catch {}
  return "script";
}

export interface Pick {
  backend: Backend;
  from: string;
  useCase?: string;
}

export function pickBackend(
  opts: { id?: string; useCase?: string; dir?: string; env?: Record<string, string | undefined> } = {},
): Pick {
  const env = opts.env ?? Bun.env;
  const dir = opts.dir ?? process.cwd();
  if (opts.id) return { backend: getBackend(opts.id), from: "argument" };
  if (env.AY_BACKEND) return { backend: getBackend(env.AY_BACKEND), from: "AY_BACKEND" };
  const file = join(dir, ENGINE_FILE);
  if (existsSync(file)) {
    const id = readFileSync(file, "utf8").trim();
    if (BACKENDS.some((b) => b.id === id)) return { backend: getBackend(id), from: ENGINE_FILE };
  }
  const useCase = opts.useCase ?? detectUseCase(dir);
  const row = USE_CASES[useCase];
  if (!row) throw new Error(`unknown use case ${useCase} (${Object.keys(USE_CASES).join(", ")})`);
  return { backend: getBackend(row.backend), from: opts.useCase ? "use case" : "detected", useCase };
}

/** Executable of the backend on this machine, or null when not installed. */
export function backendExecutable(b: Backend): string | null {
  if (!b.engine) return Bun.env.BUN_PATH || process.execPath;
  return resolveExecutable(getEngine(b.engine));
}

/** Install if needed, optionally record it in `.engine-version`; returns the executable. */
export async function useBackend(b: Backend, write: boolean, dir = process.cwd()): Promise<string> {
  let exe = backendExecutable(b);
  if (!exe && b.engine) {
    const [r] = await installEngines([b.engine]);
    if (!r?.ok) throw new Error(`install ${b.engine}: ${r?.detail ?? "failed"}`);
    exe = r.path ?? backendExecutable(b);
  }
  if (!exe) throw new Error(`${b.id}: no executable (chromium@local is built by \`ay chromium build\` on fr1)`);
  if (write) writeFileSync(join(dir, ENGINE_FILE), `${b.id}\n`);
  return exe;
}

const flag = (args: string[], name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

export async function runBackendCommand(args: string[]): Promise<number> {
  const [sub = "pick", ...rest] = args;
  const json = rest.includes("--json");
  const positional = rest.filter((a, i) => !a.startsWith("--") && !["--use", "--dir"].includes(rest[i - 1] ?? ""));
  switch (sub) {
    case "list": {
      const rows = BACKENDS.map((b) => ({
        ...b,
        path: backendExecutable(b) ?? "-",
        use_cases: Object.entries(USE_CASES).filter(([, u]) => u.backend === b.id).map(([k]) => k),
      }));
      if (json) console.log(JSON.stringify({ backends: rows, use_cases: USE_CASES }, null, 2));
      else {
        for (const r of rows) console.log(`${r.id}\t${r.js}\t${r.gpu}\t${r.use_cases.join(",") || "-"}\t${r.path}`);
        for (const [k, u] of Object.entries(USE_CASES)) console.log(`  ${k}\t-> ${u.backend}\t${u.why}`);
      }
      return 0;
    }
    case "pick":
    case "use": {
      const p = pickBackend({ id: positional[0], useCase: flag(rest, "--use"), dir: flag(rest, "--dir") });
      const exe = sub === "use"
        ? await useBackend(p.backend, rest.includes("--write"), flag(rest, "--dir"))
        : backendExecutable(p.backend);
      const out = { backend: p.backend.id, js: p.backend.js, gpu: p.backend.gpu, from: p.from, use_case: p.useCase, path: exe };
      console.log(json ? JSON.stringify(out) : `${out.backend}\t${out.from}${p.useCase ? `:${p.useCase}` : ""}\t${exe ?? "not installed"}`);
      return exe ? 0 : 1;
    }
    default:
      console.error(
        [
          "engines backend list [--json]                          backends, use cases, resolved executables",
          "engines backend pick [id] [--use <case>] [--dir d]     resolution without side effects (1 if not installed)",
          "engines backend use  [id] [--use <case>] [--write]     install if needed, --write records .engine-version",
        ].join("\n"),
      );
      return 2;
  }
}
