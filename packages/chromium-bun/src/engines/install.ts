// SPDX-License-Identifier: Apache-2.0
/**
 * Idempotent installation and update of the engines (Windows and Linux), only through
 * installeurs officiels : `ay up` (tools.toml), @puppeteer/browsers (Chrome for Testing),
 * `playwright install`, `uv tool install`. Rien n'est compilé ici : les entrées `build` renvoient
 * vers fr1 (Chromium, V8) ou prd (Blitz, JavaScriptCore).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import {
  type Engine,
  ENGINES,
  PINS,
  binDir,
  cftCache,
  cftIndexFile,
  getEngine,
  playwrightCache,
  readCftIndex,
  repoRoot,
  resolveExecutable,
} from "./registry.ts";

export interface InstallResult {
  readonly id: string;
  readonly ok: boolean;
  readonly path: string | null;
  readonly detail: string;
}

async function run(
  argv: string[],
  env: Record<string, string> = {},
): Promise<{ ok: boolean; out: string }> {
  const p = Bun.spawn(argv, {
    cwd: repoRoot(),
    env: { ...process.env, ...env },
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [out, err] = await Promise.all([
    new Response(p.stdout).text(),
    new Response(p.stderr).text(),
  ]);
  const ok = (await p.exited) === 0;
  return { ok, out: ok ? out.trim() : `${out}\n${err}`.trim() };
}

const last = (s: string) => s.trim().split(/\r?\n/).pop() ?? "";

/** Engines installable by default: everything with a downloadable binary for this platform. */
export const DEFAULT_INSTALL: readonly string[] = [
  "chrome@stable",
  "chrome-headless-shell@stable",
  "playwright-chromium",
  "playwright-webkit",
  "obscura",
  "lightpanda",
  "servo",
  "agent-browser",
  "chrome-devtools-mcp",
  "playwright-mcp",
  "apify-cli",
  "playwright-python",
  "crawlee-python",
];

export async function installEngines(
  ids: readonly string[] = DEFAULT_INSTALL,
): Promise<InstallResult[]> {
  const engines = ids.map(getEngine);
  const results: InstallResult[] = [];
  const done = (e: Engine, ok: boolean, detail: string) =>
    results.push({ id: e.id, ok, path: resolveExecutable(e), detail });

  // 1. Release binaries: a single `ay up` for all (ay compares the version and does nothing if up to date).
  const ay = engines.filter((e) => e.install.via === "ay");
  if (ay.length) {
    const tools = ay.map((e) => (e.install as { tool: string }).tool);
    const r = await run(["ay", "up", ...tools]);
    for (const e of ay) done(e, r.ok, r.ok ? "ay up" : last(r.out));
  }

  // 2. Chrome for Testing: @puppeteer/browsers resolves the channel through the official JSON API and reuses the cache.
  const cft = engines.filter((e) => e.install.via === "cft");
  if (cft.length) {
    mkdirSync(cftCache(), { recursive: true });
    const index = readCftIndex();
    for (const e of cft) {
      const i = e.install as { browser: string; channel: string };
      const r = await run([
        "bun",
        "x",
        "--bun",
        `@puppeteer/browsers@${PINS.puppeteerBrowsers}`,
        "install",
        `${i.browser}@${i.channel}`,
        "--path",
        cftCache(),
        "--format",
        "{{buildId}}\t{{path}}",
      ]);
      const [buildId, path] = last(r.out).split("\t");
      if (r.ok && buildId && path)
        index[`${i.browser}@${i.channel}`] = { buildId, path };
      writeFileSync(cftIndexFile(), JSON.stringify(index, null, 1));
      done(e, r.ok, r.ok ? `Chrome for Testing ${buildId}` : last(r.out));
    }
  }

  // 3. Playwright browsers, cache shared by the JS and Python bindings.
  const pw = engines.filter((e) => e.install.via === "playwright");
  if (pw.length) {
    const names = pw.map((e) => (e.install as { browser: string }).browser);
    const r = await run(
      [
        "bun",
        "x",
        "--bun",
        `playwright@${PINS.playwright}`,
        "install",
        ...(names.includes("chromium-headless-shell") ? [] : ["--no-shell"]),
        ...names,
      ],
      { PLAYWRIGHT_BROWSERS_PATH: playwrightCache() },
    );
    for (const e of pw)
      done(e, r.ok, r.ok ? `playwright ${PINS.playwright}` : last(r.out));
  }

  // 4. Isolated Python tools; uv does not reinstall an already satisfied specification.
  for (const e of engines.filter((x) => x.install.via === "uv")) {
    const i = e.install as { spec: string };
    const r = await run(["uv", "tool", "install", i.spec], {
      UV_TOOL_BIN_DIR: binDir(),
      PLAYWRIGHT_BROWSERS_PATH: playwrightCache(),
    });
    done(e, r.ok, r.ok ? `uv tool ${i.spec}` : last(r.out));
  }

  for (const e of engines) {
    const v = e.install.via;
    if (v === "build")
      done(
        e,
        resolveExecutable(e) !== null,
        `build on ${e.install.host} (${e.thirdParty})`,
      );
    else if (v === "dependency")
      done(e, true, `dependency ${e.install.registry} ${e.install.name}`);
    else if (v === "system")
      done(e, resolveExecutable(e) !== null, "system browser");
  }
  return ids.map((id) => results.find((r) => r.id === id)!);
}

export const installableIds = (): string[] =>
  ENGINES.filter(
    (e) => !["dependency", "build", "system"].includes(e.install.via),
  ).map((e) => e.id);
