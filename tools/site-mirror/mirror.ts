// site-mirror: render every page of a site listed by its sitemap, in real browsers, and keep everything the
// page loads. Per page: full-page screenshot (PNG), rendered DOM (HTML), and every network response body
// (documents, CSS, JS, fonts, images, video, JSON/API) written under <out>/files/<host>/<path>, plus a
// manifest of URL, status, type and size. Multi-worker (one browser context per worker), multi-engine
// (--engines chromium,firefox,webkit). Pages come from sitemap.xml (nested sitemaps followed); robots.txt
// Disallow rules are honoured for navigation.
//
// bun tools/site-mirror/mirror.ts --site https://m3.material.io --out /srv/mirror/m3 [--workers 4]
//   [--engines chromium] [--limit N] [--max-bytes 104857600] [--prefix /docs/,/api/] [--follow]
// --prefix keeps only pages whose path starts with one of the prefixes (sitemap and followed links).
// --follow also crawls same-origin links found in each rendered page (breadth first, query and fragment dropped),
// for sites whose sitemap misses pages or covers far more than the wanted section; --site may then be a deep URL.
import { mkdirSync, appendFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { chromium, firefox, webkit, type Browser, type Response } from "playwright";

const { values: a } = parseArgs({
  options: {
    site: { type: "string" },
    out: { type: "string" },
    workers: { type: "string", default: "4" },
    engines: { type: "string", default: "chromium" },
    limit: { type: "string" },
    "max-bytes": { type: "string", default: String(100 * 1024 * 1024) },
    prefix: { type: "string" },
    follow: { type: "boolean", default: false },
  },
});
if (!a.site || !a.out) {
  console.error("usage: bun tools/site-mirror/mirror.ts --site <origin> --out <dir> [--workers N] [--engines chromium,firefox,webkit]");
  process.exit(2);
}
const origin = new URL(a.site).origin;
const out = a.out;
const maxBytes = Number(a["max-bytes"]);
mkdirSync(out, { recursive: true });

const text = async (u: string) => {
  const r = await fetch(u, { signal: AbortSignal.timeout(30_000) });
  return r.ok ? r.text() : "";
};

// robots.txt (User-agent: * group)
const disallow: string[] = [];
{
  let star = false;
  for (const line of (await text(`${origin}/robots.txt`)).split("\n")) {
    const [k, ...v] = line.split(":");
    const key = k?.trim().toLowerCase();
    const val = v.join(":").trim();
    if (key === "user-agent") star = val === "*";
    else if (star && key === "disallow" && val) disallow.push(val);
  }
}
const prefixes = (a.prefix ?? "").split(",").map((x) => x.trim()).filter(Boolean);
const inScope = (u: string) => {
  const path = new URL(u).pathname;
  return !prefixes.length || prefixes.some((x) => path.startsWith(x));
};
// robots.txt patterns: `*` matches any run of characters, a trailing `$` anchors the end (RFC 9309).
const robotRe = disallow.map(
  (d) => new RegExp(`^${d.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$")}`),
);
const allowed = (u: string) => {
  const x = new URL(u);
  return inScope(u) && !robotRe.some((r) => r.test(x.pathname + x.search));
};
const canonical = (u: string) => {
  const x = new URL(u);
  x.hash = "";
  x.search = "";
  return x.href;
};

// sitemap(s)
const pages = new Set<string>();
const seen = new Set<string>();
async function sitemap(u: string) {
  if (seen.has(u)) return;
  seen.add(u);
  const x = await text(u);
  for (const m of x.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)) await sitemap(m[1]!.trim());
  for (const m of x.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)) {
    const p = m[1]!.trim();
    if (p.startsWith(origin) && allowed(p)) pages.add(p);
  }
}
// --follow starts from --site and walks links: large hosts (cloud.google.com) have sitemap indexes of thousands of files.
if (!a.follow) await sitemap(`${origin}/sitemap.xml`);
if (a.follow || !pages.size) pages.add(canonical(a.site));
let queue = [...pages].sort();
if (a.limit) queue = queue.slice(0, Number(a.limit));
console.log(`${origin}: ${queue.length} pages, robots disallow ${JSON.stringify(disallow)}`);

const manifest = join(out, "manifest.jsonl");
const fileFor = (u: URL, type: string) => {
  let p = u.pathname.endsWith("/") ? `${u.pathname}index` : u.pathname;
  if (!/\.[a-z0-9]{1,6}$/i.test(p)) p += type.includes("html") ? ".html" : type.includes("json") ? ".json" : "";
  if (u.search) p += `__${Buffer.from(u.search).toString("base64url").slice(0, 80)}`;
  // Tracking and API URLs can carry kilobytes of path parameters: long segments become a content-free hash.
  p = p.split("/").map((seg) => (seg.length > 120 ? `h${Bun.hash(seg).toString(36)}` : seg)).join("/");
  return join(out, "files", u.host, p);
};
const slug = (u: string) => new URL(u).pathname.replace(/^\/|\/$/g, "").replace(/\//g, "__") || "index";
const saved = new Set<string>();

async function keep(r: Response) {
  const url = r.url();
  if (!/^https?:/.test(url) || saved.has(url)) return;
  saved.add(url);
  const type = r.headers()["content-type"] ?? "";
  let body: Buffer | null = null;
  try {
    body = await r.body();
  } catch {
    /* redirects and streamed media have no body */
  }
  const rec = { url, status: r.status(), type, bytes: body?.length ?? 0, kind: r.request().resourceType() };
  if (body && body.length <= maxBytes) {
    const f = fileFor(new URL(url), type);
    try {
      mkdirSync(dirname(f), { recursive: true });
      await Bun.write(f, body);
      Object.assign(rec, { file: f.slice(out.length + 1) });
    } catch (e) {
      Object.assign(rec, { error: (e as Error).message.split("\n")[0] });
    }
  }
  appendFileSync(manifest, `${JSON.stringify(rec)}\n`);
}

let busy = 0;
async function worker(browser: Browser, engine: string, id: number) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  for (;;) {
    const url = queue.shift();
    if (!url) {
      // With --follow a busy worker may still enqueue links: idle workers wait until every worker is idle.
      if (busy === 0) break;
      await Bun.sleep(200);
      continue;
    }
    const shot = join(out, "screens", engine, `${slug(url)}.png`);
    if (existsSync(shot)) continue;
    busy++;
    const page = await ctx.newPage();
    page.on("response", (r) => void keep(r));
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      // scroll to trigger lazy content, then back to top
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle").catch(() => {});
      mkdirSync(dirname(shot), { recursive: true });
      await page.screenshot({ path: shot, fullPage: true });
      if (a.follow) {
        const links: string[] = await page.$$eval("a[href]", (as) => as.map((x) => (x as HTMLAnchorElement).href));
        for (const l of links) {
          if (!/^https?:/.test(l)) continue;
          const c = canonical(l);
          if (c.startsWith(origin) && allowed(c) && !pages.has(c)) {
            pages.add(c);
            queue.push(c);
          }
        }
      }
      const dom = join(out, "dom", engine, `${slug(url)}.html`);
      mkdirSync(dirname(dom), { recursive: true });
      await Bun.write(dom, await page.content());
      console.log(`[${engine}#${id}] ok ${url} (${queue.length} left)`);
    } catch (e) {
      console.log(`[${engine}#${id}] FAIL ${url}: ${String((e as Error).message).split("\n")[0]}`);
      appendFileSync(join(out, "failures.txt"), `${engine}\t${url}\n`);
    } finally {
      await page.close();
      busy--;
    }
  }
  await ctx.close();
}

const engines = { chromium, firefox, webkit } as const;
const all = queue.slice();
for (const name of a.engines!.split(",")) {
  queue = all.slice();
  const browser = await engines[name as keyof typeof engines].launch();
  await Promise.all(Array.from({ length: Number(a.workers) }, (_, i) => worker(browser, name, i)));
  await browser.close();
}
console.log(`done: ${all.length} pages, ${saved.size} responses -> ${out}`);
