// Builds the MV3 extension into dist/ with Bun (no vite): service worker, content script, public files and the pages.
// The welcome page is plain; onboarding and settings are Solid and need `bun install` (Babel with preset-solid).
//
//   bun build.ts [--dev]      OPENCODE_BROWSER_TEST_HOOKS=1 builds the stress hooks in
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = import.meta.dir;
const dist = join(root, "dist");
const dev = Bun.argv.includes("--dev");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, "public"), dist, { recursive: true });

// Identifies this build in the relay's log and status, so a reload can be told from a stale extension.
const define = {
  __OPENCODE_BROWSER_BUILD__: JSON.stringify(process.env.OPENCODE_BROWSER_BUILD ?? new Date().toISOString()),
  __OPENCODE_BROWSER_TEST_HOOKS__: JSON.stringify(process.env.OPENCODE_BROWSER_TEST_HOOKS === "1"),
};
const common = { outdir: dist, target: "browser" as const, minify: !dev, sourcemap: dev ? ("inline" as const) : ("none" as const), define };

const fail = (what: string, logs: unknown[]) => {
  console.error(`${what} failed`);
  for (const log of logs) console.error(String(log));
  process.exit(1);
};

// The service worker keeps a stable name (manifest.json); everything else is content-hashed.
const worker = await Bun.build({ ...common, entrypoints: [join(root, "src/background/index.ts")], naming: "background.js", format: "esm" });
if (!worker.success) fail("background", worker.logs);

// Content scripts are classic scripts and cannot import modules: one IIFE.
const content = await Bun.build({ ...common, entrypoints: [join(root, "src/content/page-status.ts")], naming: "content.js", format: "iife" });
if (!content.success) fail("content script", content.logs);

// Solid compiles its JSX to DOM expressions through Babel (preset-solid); TypeScript is stripped by preset-typescript.
const solidPlugin = async (): Promise<import("bun").BunPlugin | undefined> => {
  try {
    const { transformAsync } = await import("@babel/core");
    const typescript = (await import("@babel/preset-typescript")).default;
    const solid = (await import("babel-preset-solid")).default;
    return {
      name: "solid",
      setup(build) {
        build.onLoad({ filter: /\.tsx$/ }, async ({ path }) => {
          const result = await transformAsync(await Bun.file(path).text(), { filename: path, presets: [[solid, {}], [typescript, { isTSX: true, allExtensions: true }]] });
          return { contents: result?.code ?? "", loader: "js" };
        });
      },
    };
  } catch {
    return undefined;
  }
};

const pages = [{ html: "welcome.html", solid: false }, { html: "onboarding.html", solid: true }, { html: "settings.html", solid: true }];
let solid: import("bun").BunPlugin | undefined;
for (const page of pages) {
  if (page.solid && !(solid ??= await solidPlugin())) {
    console.warn(`skipping ${page.html}: run bun install (babel-preset-solid)`);
    continue;
  }
  const result = await Bun.build({
    ...common,
    entrypoints: [join(root, page.html)],
    naming: { entry: "[name].[ext]", chunk: "assets/[name]-[hash].[ext]", asset: "assets/[name]-[hash].[ext]" },
    plugins: page.solid && solid ? [solid] : [],
  });
  if (!result.success) fail(page.html, result.logs);
}

for (const required of ["manifest.json", "background.js", "content.js", "welcome.html"]) {
  if (!existsSync(join(dist, required))) fail(`missing ${required}`, []);
}
console.log(`extension built in ${dist}`);
