// SPDX-License-Identifier: Apache-2.0
/**
 * Registry of browsing, automation and crawl engines: where each comes from (upstream repository), how its binary
 * is installed (ay up, Chrome for Testing, Playwright, uv tool, built from source, system) and which protocol it
 * speaks (CDP, WebDriver, Playwright, MCP, CLI, library). No version is written here: installers fetch the latest.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type EngineProtocol =
  "cdp" | "webdriver" | "playwright" | "mcp" | "cli" | "library";

export type CftBrowser = "chrome" | "chrome-headless-shell";
export type CftChannel = "stable" | "beta" | "dev" | "canary";
/** Embedded JavaScript engine and WebGPU implementation, for the matrix and the combinations. */
export type JsEngine = "v8" | "javascriptcore" | "spidermonkey" | "none";
export type GpuBackend = "dawn" | "wgpu" | "none";
export type PlaywrightBrowser =
  "chromium" | "chromium-headless-shell" | "webkit";

export type EngineInstall =
  /** Release binary installed by `ay up <tool>` (the tool manifest embedded in ay, or AY_TOOLS_MANIFEST). */
  | { via: "ay"; tool: string; bin: string }
  /** Chrome for Testing (official JSON API) through @puppeteer/browsers. */
  | { via: "cft"; browser: CftBrowser; channel: CftChannel }
  /** Playwright browsers (`playwright install`), cache shared by JS and Python. */
  | { via: "playwright"; browser: PlaywrightBrowser }
  /** Python tool isolated by `uv tool install`. */
  | { via: "uv"; spec: string; bin: string }
  /** Built from the upstream source by the caller; `outEnv` names the environment variable that gives the build
   *  output directory, where `bin` (default chrome) is looked up. */
  | { via: "build"; outEnv?: string; bin?: string }
  /** Library consumed as a dependency (bun add, uv add, cargo), no binary. */
  | { via: "dependency"; registry: "npm" | "pypi" | "crates"; name: string }
  /** Browser installed by the system (Chrome, Edge). */
  | { via: "system" };

export interface Engine {
  readonly id: string;
  readonly title: string;
  readonly language: string;
  readonly protocol: EngineProtocol;
  readonly upstream: string;
  readonly install: EngineInstall;
  /** Role in the matrix when the protocol is not enough (rendering libraries, JS engines, WebGPU). */
  readonly role?: "render" | "js-engine" | "gpu";
  readonly js: JsEngine;
  readonly gpu: GpuBackend;
  /** Official source of the latest version, queried by `engines matrix`. */
  readonly latest?: Latest;
  /** argv (without the executable) that exposes the protocol on 127.0.0.1:<port>. */
  serve?(port: number, profileDir: string): string[];
}

export const binDir = (): string => join(homedir(), ".local", "bin");

/** Cache of downloaded browsers: BROWSER_ENGINES_CACHE, otherwise the user cache directory of the platform. */
export const browsersCache = (): string =>
  Bun.env.BROWSER_ENGINES_CACHE ||
  (process.platform === "win32"
    ? join(
        Bun.env.LOCALAPPDATA || join(homedir(), "AppData", "Local"),
        "browser-engines",
        "browsers",
      )
    : join(
        Bun.env.XDG_CACHE_HOME || join(homedir(), ".cache"),
        "browser-engines",
        "browsers",
      ));

export const cftCache = (): string => join(browsersCache(), "cft");
export const playwrightCache = (): string =>
  join(browsersCache(), "ms-playwright");
const exe = (name: string) =>
  process.platform === "win32" ? `${name}.exe` : name;

const chromeFlags =
  (headlessFlag: boolean) => (port: number, profileDir: string) => [
    ...(headlessFlag ? ["--headless=new"] : []),
    `--remote-debugging-port=${port}`,
    "--remote-debugging-address=127.0.0.1",
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-extensions",
    "about:blank",
  ];

export type Latest =
  | { from: "cft"; channel: CftChannel }
  | { from: "github"; repo: string; prefix?: string }
  | { from: "npm"; name: string }
  | { from: "pypi"; name: string }
  | { from: "crates"; name: string }
  | { from: "playwright"; browser: PlaywrightBrowser };

const CHANNELS: readonly CftChannel[] = ["stable", "beta", "dev", "canary"];
const gh = (r: string) => `https://github.com/${r}`;

export const ENGINES: readonly Engine[] = [
  ...CHANNELS.flatMap((channel): Engine[] => [
    {
      id: `chrome@${channel}`,
      title: `Chrome for Testing (${channel})`,
      language: "C++",
      protocol: "cdp",
      upstream: gh("GoogleChromeLabs/chrome-for-testing"),
      install: { via: "cft", browser: "chrome", channel },
      js: "v8",
      gpu: "dawn",
      latest: { from: "cft", channel },
      serve: chromeFlags(true),
    },
    {
      id: `chrome-headless-shell@${channel}`,
      title: `chrome-headless-shell (${channel})`,
      language: "C++",
      protocol: "cdp",
      upstream: gh("GoogleChromeLabs/chrome-for-testing"),
      install: { via: "cft", browser: "chrome-headless-shell", channel },
      js: "v8",
      gpu: "dawn",
      latest: { from: "cft", channel },
      serve: chromeFlags(false),
    },
  ]),
  {
    id: "chromium",
    js: "v8",
    gpu: "dawn",
    title: "Chromium built from source (gclient)",
    language: "C++",
    protocol: "cdp",
    upstream: "https://chromium.googlesource.com/chromium/src",
    install: { via: "build", outEnv: "BROWSER_ENGINES_CHROMIUM_OUT" },
    serve: chromeFlags(true),
  },
  {
    id: "chrome",
    js: "v8",
    gpu: "dawn",
    title: "System Chrome or Edge",
    language: "C++",
    protocol: "cdp",
    upstream: "https://www.google.com/chrome/",
    install: { via: "system" },
    serve: chromeFlags(true),
  },
  ...(
    ["chromium", "chromium-headless-shell", "webkit"] as const
  ).map((browser): Engine => ({
    id: `playwright-${browser}`,
    title: `Playwright ${browser}`,
    language: "C++",
    protocol: browser.startsWith("chromium") ? "cdp" : "playwright",
    upstream: gh("microsoft/playwright"),
    install: { via: "playwright", browser },
    js: browser === "webkit" ? "javascriptcore" : "v8",
    gpu: browser === "webkit" ? "none" : "dawn",
    latest: { from: "playwright", browser },
    ...(browser.startsWith("chromium")
      ? { serve: chromeFlags(browser === "chromium") }
      : {}),
  })),
  {
    id: "obscura",
    js: "v8",
    gpu: "none",
    latest: { from: "github", repo: "h4ckf0r0day/obscura" },
    title: "Obscura",
    language: "Rust",
    protocol: "cdp",
    upstream: gh("h4ckf0r0day/obscura"),
    install: { via: "ay", tool: "obscura", bin: "obscura" },
    serve: (port) => ["serve", "--port", String(port)],
  },
  {
    id: "lightpanda",
    js: "v8",
    gpu: "none",
    latest: { from: "github", repo: "lightpanda-io/browser" },
    title: "Lightpanda (Zig headless browser, release binary)",
    language: "Zig",
    protocol: "cdp",
    upstream: gh("lightpanda-io/browser"),
    install: { via: "ay", tool: "lightpanda", bin: "lightpanda" },
    serve: (port) => ["serve", "--host", "127.0.0.1", "--port", String(port)],
  },
  {
    id: "servo",
    js: "spidermonkey",
    gpu: "wgpu",
    latest: { from: "github", repo: "servo/servo" },
    title: "Servo",
    language: "Rust",
    protocol: "webdriver",
    upstream: gh("servo/servo"),
    install: { via: "ay", tool: "servo", bin: "servo" },
    serve: (port) => ["--headless", `--webdriver=${port}`, "about:blank"],
  },
  {
    id: "blitz",
    role: "render",
    js: "none",
    gpu: "wgpu",
    latest: { from: "crates", name: "blitz" },
    title: "Blitz (HTML/CSS, Stylo + Taffy + anyrender)",
    language: "Rust",
    protocol: "library",
    upstream: gh("DioxusLabs/blitz"),
    install: { via: "build" },
  },
  {
    id: "javascriptcore",
    role: "js-engine",
    js: "javascriptcore",
    gpu: "none",
    title: "JavaScriptCore de bun (oven-sh/WebKit)",
    language: "C++",
    protocol: "library",
    upstream: gh("oven-sh/WebKit"),
    install: { via: "build" },
  },
  {
    id: "v8",
    role: "js-engine",
    js: "v8",
    gpu: "none",
    title: "V8 of the repository Chromium",
    language: "C++",
    protocol: "library",
    upstream: "https://chromium.googlesource.com/v8/v8",
    install: { via: "build" },
  },
  {
    id: "dawn",
    role: "gpu",
    title: "Dawn (WebGPU de Chromium)",
    language: "C++",
    protocol: "library",
    upstream: gh("google/dawn"),
    install: { via: "build" },
    js: "none",
    gpu: "dawn",
  },
  {
    id: "wgpu",
    role: "gpu",
    title: "wgpu (WebGPU de Firefox, Servo, Deno)",
    language: "Rust",
    protocol: "library",
    upstream: gh("gfx-rs/wgpu"),
    install: { via: "dependency", registry: "crates", name: "wgpu" },
    js: "none",
    gpu: "wgpu",
    latest: { from: "crates", name: "wgpu" },
  },
  {
    id: "agent-browser",
    js: "none",
    gpu: "none",
    latest: { from: "github", repo: "vercel-labs/agent-browser" },
    title: "agent-browser (CLI et MCP)",
    language: "Rust",
    protocol: "cli",
    upstream: gh("vercel-labs/agent-browser"),
    install: { via: "ay", tool: "agent-browser", bin: "agent-browser" },
  },
  {
    id: "chrome-devtools-mcp",
    js: "none",
    gpu: "none",
    latest: { from: "npm", name: "chrome-devtools-mcp" },
    title: "Chrome DevTools MCP",
    language: "TypeScript",
    protocol: "mcp",
    upstream: gh("ChromeDevTools/chrome-devtools-mcp"),
    install: {
      via: "ay",
      tool: "chrome-devtools-mcp",
      bin: "chrome-devtools-mcp",
    },
  },
  {
    id: "playwright-mcp",
    js: "none",
    gpu: "none",
    latest: { from: "npm", name: "@playwright/mcp" },
    title: "Playwright MCP",
    language: "TypeScript",
    protocol: "mcp",
    upstream: gh("microsoft/playwright-mcp"),
    install: { via: "ay", tool: "playwright-mcp", bin: "playwright-mcp" },
  },
  {
    id: "playwright-python",
    js: "none",
    gpu: "none",
    latest: { from: "pypi", name: "playwright" },
    title: "Playwright for Python",
    language: "Python",
    protocol: "cli",
    upstream: gh("microsoft/playwright-python"),
    install: {
      via: "uv",
      spec: "playwright",
      bin: "playwright",
    },
  },
  {
    id: "crawlee-python",
    js: "none",
    gpu: "none",
    latest: { from: "pypi", name: "crawlee" },
    title: "Crawlee for Python",
    language: "Python",
    protocol: "cli",
    upstream: gh("apify/crawlee-python"),
    install: {
      via: "uv",
      spec: "crawlee[cli]",
      bin: "crawlee",
    },
  },
  {
    id: "apify-cli",
    js: "none",
    gpu: "none",
    latest: { from: "npm", name: "apify-cli" },
    title: "Apify CLI (plateforme Apify)",
    language: "TypeScript",
    protocol: "cli",
    upstream: gh("apify/apify-cli"),
    install: { via: "ay", tool: "apify-cli", bin: "apify" },
  },
  {
    id: "crawlee",
    js: "none",
    gpu: "none",
    latest: { from: "npm", name: "crawlee" },
    title: "Crawlee (JS)",
    language: "TypeScript",
    protocol: "library",
    upstream: gh("apify/crawlee"),
    install: { via: "dependency", registry: "npm", name: "crawlee" },
  },
  {
    id: "puppeteer",
    js: "none",
    gpu: "none",
    latest: { from: "npm", name: "puppeteer-core" },
    title: "Puppeteer",
    language: "TypeScript",
    protocol: "library",
    upstream: gh("puppeteer/puppeteer"),
    install: { via: "dependency", registry: "npm", name: "puppeteer-core" },
  },
  {
    id: "playwright",
    js: "none",
    gpu: "none",
    latest: { from: "npm", name: "playwright-core" },
    title: "Playwright (JS)",
    language: "TypeScript",
    protocol: "library",
    upstream: gh("microsoft/playwright"),
    install: { via: "dependency", registry: "npm", name: "playwright-core" },
  },
  {
    id: "apify-sdk",
    js: "none",
    gpu: "none",
    latest: { from: "npm", name: "apify" },
    title: "Apify SDK (JS)",
    language: "TypeScript",
    protocol: "library",
    upstream: gh("apify/apify-sdk-js"),
    install: { via: "dependency", registry: "npm", name: "apify" },
  },
  {
    id: "apify-sdk-python",
    js: "none",
    gpu: "none",
    latest: { from: "pypi", name: "apify" },
    title: "Apify SDK (Python)",
    language: "Python",
    protocol: "library",
    upstream: gh("apify/apify-sdk-python"),
    install: { via: "dependency", registry: "pypi", name: "apify" },
  },
  {
    id: "apify-client",
    js: "none",
    gpu: "none",
    latest: { from: "npm", name: "apify-client" },
    title: "Client API Apify (JS)",
    language: "TypeScript",
    protocol: "library",
    upstream: gh("apify/apify-client-js"),
    install: { via: "dependency", registry: "npm", name: "apify-client" },
  },
  {
    id: "apify-client-python",
    js: "none",
    gpu: "none",
    latest: { from: "pypi", name: "apify-client" },
    title: "Client API Apify (Python)",
    language: "Python",
    protocol: "library",
    upstream: gh("apify/apify-client-python"),
    install: { via: "dependency", registry: "pypi", name: "apify-client" },
  },
];

export function getEngine(id: string): Engine {
  const e = ENGINES.find((x) => x.id === id);
  if (!e)
    throw new Error(
      `unknown engine: ${id} (see \`browser-engines engines list\`)`,
    );
  return e;
}

/** Channel -> executable mapping written by the Chrome for Testing installation. */
export const cftIndexFile = (): string => join(cftCache(), "channels.json");
export const readCftIndex = (): Record<
  string,
  { buildId: string; path: string }
> => {
  try {
    return JSON.parse(readFileSync(cftIndexFile(), "utf8"));
  } catch {
    return {};
  }
};

const PLAYWRIGHT_LAYOUT: Record<
  PlaywrightBrowser,
  { dir: string; rel: Record<string, string[]> }
> = {
  chromium: {
    dir: "chromium-",
    rel: {
      win32: ["chrome-win64/chrome.exe", "chrome-win/chrome.exe"],
      linux: ["chrome-linux64/chrome", "chrome-linux/chrome"],
      darwin: [
        "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
      ],
    },
  },
  "chromium-headless-shell": {
    dir: "chromium_headless_shell-",
    rel: {
      win32: [
        "chrome-headless-shell-win64/chrome-headless-shell.exe",
        "chrome-win/headless_shell.exe",
      ],
      linux: [
        "chrome-headless-shell-linux64/chrome-headless-shell",
        "chrome-linux/headless_shell",
      ],
      darwin: [
        "chrome-headless-shell-mac-arm64/chrome-headless-shell",
        "chrome-mac/headless_shell",
      ],
    },
  },
  webkit: {
    dir: "webkit-",
    rel: {
      win32: ["Playwright.exe"],
      linux: ["pw_run.sh"],
      darwin: ["pw_run.sh"],
    },
  },
};

function playwrightExecutable(browser: PlaywrightBrowser): string | null {
  const root = playwrightCache();
  if (!existsSync(root)) return null;
  const layout = PLAYWRIGHT_LAYOUT[browser];
  const dirs = readdirSync(root)
    .filter(
      (d) =>
        d.startsWith(layout.dir) && /^\d+$/.test(d.slice(layout.dir.length)),
    )
    .sort(
      (a, b) =>
        Number(b.slice(layout.dir.length)) - Number(a.slice(layout.dir.length)),
    );
  for (const d of dirs)
    for (const rel of layout.rel[process.platform] ?? [])
      if (existsSync(join(root, d, rel))) return join(root, d, rel);
  return null;
}

function systemChrome(): string | null {
  if (process.platform === "win32") {
    for (const app of ["chrome.exe", "msedge.exe"]) {
      const q = Bun.spawnSync([
        "reg",
        "query",
        `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${app}`,
        "/ve",
      ]);
      const m = /REG_SZ\s+(.+\.exe)/i.exec(q.stdout.toString());
      if (m && existsSync(m[1]!.trim())) return m[1]!.trim();
    }
  }
  for (const c of [
    "google-chrome-stable",
    "google-chrome",
    "chromium",
    "chromium-browser",
    "chrome",
    "microsoft-edge",
  ]) {
    const p = Bun.which(c);
    if (p) return p;
  }
  return null;
}

/** Engine executable if present on this machine, otherwise null (no download). */
export function resolveExecutable(engine: Engine): string | null {
  const i = engine.install;
  switch (i.via) {
    case "ay": {
      const local = join(binDir(), exe(i.bin));
      return existsSync(local) ? local : (Bun.which(i.bin) ?? null);
    }
    case "uv": {
      // uv tool install writes to UV_TOOL_BIN_DIR = binDir(); a namesake elsewhere (global bun) does not count.
      const local = join(binDir(), exe(i.bin));
      return existsSync(local) ? local : null;
    }
    case "cft":
      return readCftIndex()[`${i.browser}@${i.channel}`]?.path ?? null;
    case "playwright":
      return playwrightExecutable(i.browser);
    case "system":
      return systemChrome();
    case "build": {
      const out = i.outEnv ? Bun.env[i.outEnv] : undefined;
      const p = out ? join(out, exe(i.bin ?? "chrome")) : null;
      return p && existsSync(p) ? p : null;
    }
    case "dependency":
      return null;
  }
}

/** First available Chromium: CHROME_PATH, a source build, stable Chrome for Testing, Playwright, system. */
export function resolveChromium(): string | null {
  if (Bun.env.CHROME_PATH && existsSync(Bun.env.CHROME_PATH))
    return Bun.env.CHROME_PATH;
  for (const id of [
    "chromium",
    "chrome@stable",
    "chrome-headless-shell@stable",
    "playwright-chromium",
    "chrome",
  ]) {
    const p = resolveExecutable(getEngine(id));
    if (p) return p;
  }
  return null;
}
