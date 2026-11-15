// extract: the design facts of a mirrored site, for use as a design source without redistributing its content.
// From a site-mirror output directory it writes, under --to:
//   pages.json   every page: URL, HTTP status, title, rendered-DOM size and SHA-256, screenshot file name
//   design.json  what the site's own stylesheets use, ranked by frequency: custom properties with their values,
//                colors, font families, font sizes, line heights, radii, shadows, spacing, breakpoints, transitions
//   README.md    how the files were produced and how to reproduce them
// Article text, images and scripts stay in the mirror; only facts measured from them are written.
// bun tools/site-mirror/extract.ts --mirror <site-mirror out dir> --to <dir> [--hosts design.google,www.gstatic.com]
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

const { values: a } = parseArgs({ options: { mirror: { type: "string" }, to: { type: "string" }, hosts: { type: "string" } } });
if (!a.mirror || !a.to) throw new Error("usage: bun tools/site-mirror/extract.ts --mirror <dir> --to <dir> [--hosts a,b]");
type Rec = { url: string; status: number; type: string; bytes: number; kind: string; file?: string; screenshot?: string };
const recs: Rec[] = readFileSync(join(a.mirror, "manifest.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const docs = recs.filter((r) => r.kind === "document" && r.status === 200 && r.file);
const site = new URL(docs[0]?.url ?? recs[0]!.url).hostname;
// the site's own stylesheets: its host, plus the hosts given (a CDN serving its CSS)
const hosts = new Set([site, ...(a.hosts?.split(",").filter(Boolean) ?? [])]);
const read = (f: string) => (existsSync(join(a.mirror!, f)) ? readFileSync(join(a.mirror!, f), "utf8") : "");

const screens = new Set(existsSync(join(a.mirror, "screens")) ? readdirSync(join(a.mirror, "screens")) : []);
const pages = docs.map((d) => {
  const html = read(d.file!);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
  const shot = [...screens].find((s) => s.startsWith(encodeURIComponent(new URL(d.url).pathname).slice(0, 40))) ?? null;
  return { url: d.url, status: d.status, title, bytes: html.length, sha256: createHash("sha256").update(html).digest("hex"), screenshot: d.screenshot ?? shot };
});

// stylesheets: CSS files of the site's hosts and the <style> blocks of its rendered pages
const css: string[] = [];
for (const r of recs) if (r.file && /css/.test(r.type) && hosts.has(new URL(r.url).hostname)) css.push(read(r.file));
for (const d of docs) for (const m of read(d.file!).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) css.push(m[1]!);
const all = css.join("\n");

const count = (re: RegExp, pick = (m: RegExpMatchArray) => m[1]!.trim()) => {
  const c = new Map<string, number>();
  for (const m of all.matchAll(re)) {
    const v = pick(m).replace(/\s+/g, " ");
    if (v) c.set(v, (c.get(v) ?? 0) + 1);
  }
  return [...c].sort((x, y) => y[1] - x[1]).map(([value, uses]) => ({ value, uses }));
};
const props = new Map<string, Map<string, number>>();
for (const m of all.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
  const k = m[1]!, v = m[2]!.trim();
  const vs = props.get(k) ?? new Map<string, number>();
  vs.set(v, (vs.get(v) ?? 0) + 1);
  props.set(k, vs);
}
const design = {
  site,
  stylesheets: css.length,
  bytes: all.length,
  customProperties: [...props].map(([name, vs]) => ({ name, values: [...vs].sort((x, y) => y[1] - x[1]).slice(0, 5).map(([v, n]) => ({ value: v, uses: n })), uses: [...vs.values()].reduce((s, n) => s + n, 0) })).sort((x, y) => y.uses - x.uses),
  colors: count(/(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\))/g, (m) => m[1]!.toLowerCase()).slice(0, 200),
  fontFamilies: count(/font-family\s*:\s*([^;}]+)/g).slice(0, 50),
  fontSizes: count(/font-size\s*:\s*([^;}]+)/g).slice(0, 80),
  fontWeights: count(/font-weight\s*:\s*([^;}]+)/g).slice(0, 20),
  lineHeights: count(/line-height\s*:\s*([^;}]+)/g).slice(0, 60),
  letterSpacing: count(/letter-spacing\s*:\s*([^;}]+)/g).slice(0, 40),
  radii: count(/border-radius\s*:\s*([^;}]+)/g).slice(0, 60),
  shadows: count(/box-shadow\s*:\s*([^;}]+)/g).slice(0, 60),
  spacing: count(/(?:^|[;{\s])(?:margin|padding|gap)(?:-[a-z]+)?\s*:\s*([^;}]+)/g).slice(0, 80),
  breakpoints: count(/@media[^{]*?\((?:min|max)-width\s*:\s*([^)]+)\)/g).slice(0, 40),
  transitions: count(/transition(?:-timing-function)?\s*:\s*([^;}]+)/g).slice(0, 40),
  fontFaces: count(/@font-face\s*{[^}]*font-family\s*:\s*([^;}]+)/g),
};

mkdirSync(a.to, { recursive: true });
await Bun.write(join(a.to, "pages.json"), `${JSON.stringify({ site, pages: pages.length, records: recs.length, list: pages }, null, 2)}\n`);
await Bun.write(join(a.to, "design.json"), `${JSON.stringify(design, null, 2)}\n`);
await Bun.write(
  join(a.to, "README.md"),
  [
    `# ${site}`,
    "",
    `Design facts measured from a browser-rendered mirror of ${site} (\`tools/site-mirror\`): ${pages.length} pages, ${recs.length} recorded responses, ${css.length} stylesheets.`,
    "",
    "| File | Contents |",
    "|---|---|",
    "| [pages.json](pages.json) | every page: URL, status, title, rendered-DOM size and SHA-256, screenshot name |",
    "| [design.json](design.json) | custom properties, colors, font families and sizes, line heights, radii, shadows, spacing, breakpoints, transitions, ranked by use |",
    "",
    "The mirror itself (pages, screenshots, assets) is not stored here: it is the site's content. Reproduce it:",
    "",
    "```sh",
    `bun tools/site-mirror/mirror.ts --site https://${site} --out <dir>`,
    `bun tools/site-mirror/extract.ts --mirror <dir> --to reference/${site}`,
    "```",
    "",
  ].join("\n"),
);
console.log(JSON.stringify({ site, pages: pages.length, stylesheets: css.length, customProperties: design.customProperties.length, colors: design.colors.length }));
