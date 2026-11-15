// Every Bun doc page as a render tree: the MDX is parsed with the reference MDX parser (unified + remark-mdx),
// Markdown runs are rendered by Bun.markdown, JSX elements are kept as nodes for the client to map onto
// Material 3 components, and fenced code blocks become runnable usages of the feature the page describes.
// Output: pages.json (render trees) and snippets.json (code blocks by skill, the runner's input).
// bun gen/pages.ts [--docs <dir>]
import { join } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";

type Pos = { start: { line: number; offset: number }; end: { offset: number } };
type Mdast = { type: string; name?: string | null; attributes?: { type: string; name: string; value?: unknown }[]; children?: Mdast[]; lang?: string | null; meta?: string | null; value?: string; position?: Pos };
export type Block =
  | { t: "md"; html: string }
  | { t: "code"; id: number; lang: string; file: string | null; code: string; run: "script" | "test" | "shell" | null }
  | { t: "jsx"; name: string; attrs: Record<string, string | boolean>; children: Block[] };

const app = join(import.meta.dir, "..");
const argv = Bun.argv.slice(2);
const docs = argv.includes("--docs") ? argv[argv.indexOf("--docs") + 1]! : join(app, "../../.cache/bun-fork/docs");
const { skills } = (await Bun.file(join(app, "skills.json")).json()) as { skills: { name: string; source: string; title: string; description: string; section: string }[] };

// Navigation of the docs site (Mintlify docs.json): tab and group of every listed page; unlisted pages keep their folder.
type NavNode = string | { tab?: string; group?: string; pages?: NavNode[]; groups?: NavNode[] };
const nav = new Map<string, { tab: string; group: string }>();
const walkNav = (n: NavNode, tab: string, group: string) => {
  if (typeof n === "string") return void nav.set(n.replace(/^\//, "") + ".mdx", { tab, group });
  for (const c of [...(n.groups ?? []), ...(n.pages ?? [])]) walkNav(c, n.tab ?? tab, n.group ?? group);
};
for (const t of (await Bun.file(join(docs, "docs.json")).json()).navigation.tabs) walkNav(t, t.tab, t.tab);
// a page reached from a listed index page (lint rules from lint/rules/index) belongs where that index is
const inherit = (source: string) => {
  for (let dir = source.split("/").slice(0, -1); dir.length; dir.pop()) {
    const at = nav.get(`${dir.join("/")}/index.mdx`) ?? [...nav].find(([k]) => k.startsWith(`${dir.join("/")}/`))?.[1];
    if (at) return at;
  }
  return null;
};

const mdx = unified().use(remarkParse).use(remarkFrontmatter).use(remarkGfm).use(remarkMdx);
const md = unified().use(remarkParse).use(remarkFrontmatter).use(remarkGfm);
const scripts = new Set(["ts", "tsx", "js", "jsx", "typescript", "javascript", "mjs", "cjs", "mts", "cts"]);
const shells = new Set(["sh", "bash", "shell", "zsh", "terminal", "console"]);

function runKind(lang: string, code: string): "script" | "test" | "shell" | null {
  if (scripts.has(lang)) return /from\s+["']bun:test["']/.test(code) ? "test" : "script";
  if (shells.has(lang) && /^\s*\$?\s*bun\s/m.test(code)) return "shell";
  return null;
}

// Source slice covering a run of sibling nodes, from the start of the first node's line, dedented.
function slice(src: string, nodes: Mdast[]): string {
  const first = nodes[0]!.position!, last = nodes.at(-1)!.position!;
  const from = src.lastIndexOf("\n", first.start.offset - 1) + 1;
  const lines = src.slice(from, last.end.offset).split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length));
  return lines.map((l) => l.slice(indent)).join("\n");
}

function attrs(n: Mdast): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const a of n.attributes ?? []) {
    if (a.type !== "mdxJsxAttribute") continue;
    out[a.name] = a.value == null ? true : typeof a.value === "string" ? a.value : String((a.value as { value?: string }).value ?? "");
  }
  return out;
}

function blocks(src: string, nodes: Mdast[], counter: { n: number }, out: Snip[]): Block[] {
  const res: Block[] = [];
  let run: Mdast[] = [];
  const flush = () => {
    if (run.length) res.push({ t: "md", html: Bun.markdown.html(slice(src, run)) });
    run = [];
  };
  for (const n of nodes) {
    if (n.type === "yaml" || n.type === "mdxjsEsm" || n.type === "mdxFlowExpression") continue;
    if (n.type === "code") {
      flush();
      const lang = (n.lang ?? "").toLowerCase();
      const file = n.meta?.match(/(?:^|\s)([\w./@-]+\.\w+)(?=\s|$)/)?.[1] ?? null;
      const code = n.value ?? "";
      const kind = runKind(lang, code);
      const id = counter.n++;
      out.push({ id, lang, file, code, run: kind });
      res.push({ t: "code", id, lang, file, code, run: kind });
    } else if (n.type === "mdxJsxFlowElement" && n.name) {
      flush();
      res.push({ t: "jsx", name: n.name, attrs: attrs(n), children: blocks(src, n.children ?? [], counter, out) });
    } else if (n.position) run.push(n);
  }
  flush();
  return res;
}

type Snip = { id: number; lang: string; file: string | null; code: string; run: "script" | "test" | "shell" | null };
const pages: Record<string, { title: string; description: string; section: string; tab: string; group: string; source: string; parser: "mdx" | "markdown"; blocks: Block[] }> = {};
const snippets: Record<string, Snip[]> = {};
let fallback = 0, codeBlocks = 0, runnable = 0;
const jsxNames = new Map<string, number>();
for (const s of skills) {
  const src = await Bun.file(join(docs, s.source)).text();
  let tree: Mdast, parser: "mdx" | "markdown" = "mdx";
  try {
    tree = mdx.parse(src) as Mdast;
  } catch {
    tree = md.parse(src) as Mdast;
    parser = "markdown";
    fallback++;
  }
  const out: Snip[] = [];
  const b = blocks(src, tree.children ?? [], { n: 0 }, out);
  const walk = (xs: Block[]) => xs.forEach((x) => x.t === "jsx" && (jsxNames.set(x.name, (jsxNames.get(x.name) ?? 0) + 1), walk(x.children)));
  walk(b);
  const where = nav.get(s.source) ?? inherit(s.source) ?? { tab: "Unlisted", group: s.source.includes("/") ? s.source.split("/")[0]! : "root" };
  pages[s.name] = { title: s.title, description: s.description, section: s.section, tab: where.tab, group: where.group, source: s.source, parser, blocks: b };
  if (out.length) snippets[s.name] = out;
  codeBlocks += out.length;
  runnable += out.filter((x) => x.run).length;
}
await Bun.write(join(app, "pages.json"), `${JSON.stringify(pages)}\n`);
await Bun.write(join(app, "snippets.json"), `${JSON.stringify(snippets)}\n`);
console.log(JSON.stringify({ pages: skills.length, listed: Object.values(pages).filter((p) => p.tab !== "Unlisted").length, mdxFallbackToMarkdown: fallback, codeBlocks, runnable, jsx: Object.fromEntries([...jsxNames].sort((a, b) => b[1] - a[1])) }));
