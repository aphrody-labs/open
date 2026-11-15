// The Reference tab of the Bun docs site (bun.com/reference) is generated from bun-types: its JSDoc carries the
// API descriptions and code examples. This turns each declaration file into a reference page and a skill, with
// every JSDoc code example as a runnable usage, next to the MDX pages. Run after gen/skills.ts and gen/pages.ts.
// bun gen/reference.ts [--types <dir>]
import { mkdirSync } from "node:fs";
import { join, relative } from "node:path";

type Snip = { id: number; lang: string; file: string | null; code: string; run: "script" | "test" | "shell" | null };
type Block = { t: "md"; html: string } | ({ t: "code" } & Snip) | { t: "jsx"; name: string; attrs: Record<string, string | boolean>; children: Block[] };

const app = join(import.meta.dir, "..");
const argv = Bun.argv.slice(2);
const types = argv.includes("--types") ? argv[argv.indexOf("--types") + 1]! : join(app, "../../.cache/bun-fork/packages/bun-types");
const scripts = new Set(["ts", "tsx", "js", "jsx", "typescript", "javascript", "mjs", "cjs", ""]);
const runKind = (lang: string, code: string): Snip["run"] =>
  scripts.has(lang) ? (/from\s+["']bun:test["']/.test(code) ? "test" : "script") : /^(sh|bash|shell)$/.test(lang) && /^\s*\$?\s*bun\s/m.test(code) ? "shell" : null;

const files = [...new Bun.Glob("*.d.ts").scanSync({ cwd: types })].sort();
const skillsJson = await Bun.file(join(app, "skills.json")).json();
const pages = await Bun.file(join(app, "pages.json")).json();
const snippets = await Bun.file(join(app, "snippets.json")).json();
for (const k of Object.keys(pages)) if (pages[k].tab === "Reference") (delete pages[k], delete snippets[k]);
skillsJson.skills = skillsJson.skills.filter((s: { name: string }) => !s.name.startsWith("bun-reference-"));

let total = 0, runnable = 0;
for (const f of files) {
  const src = await Bun.file(join(types, f)).text();
  const sections: { decl: string; text: string; code: { lang: string; code: string }[] }[] = [];
  for (const m of src.matchAll(/\/\*\*([\s\S]*?)\*\/\s*\n\s*([^\n]*)/g)) {
    const doc = m[1]!.split("\n").map((l) => l.replace(/^\s*\* ?/, "")).join("\n");
    const code = [...doc.matchAll(/```(\w*)[^\n]*\n([\s\S]*?)```/g)].map((c) => ({ lang: c[1]!.toLowerCase(), code: c[2]! }));
    if (!code.length) continue;
    const decl = m[2]!.match(/(?:function|class|interface|const|let|var|type|namespace|get|set)?\s*([A-Za-z_$][\w$]*)\s*[(<:=?{]/)?.[1] ?? m[2]!.trim().slice(0, 60);
    const text = doc.replace(/```[\s\S]*?```/g, "").replace(/^@\w+.*$/gm, "").trim();
    sections.push({ decl, text, code });
  }
  if (!sections.length) continue;
  const base = f.replace(/\.d\.ts$/, "");
  const name = `bun-reference-${base}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 64);
  const blocks: Block[] = [];
  const snips: Snip[] = [];
  let id = 0;
  const md: string[] = [`# ${base}`, ""];
  for (const s of sections) {
    blocks.push({ t: "md", html: Bun.markdown.html(`## \`${s.decl}\`\n\n${s.text}`) });
    md.push(`## \`${s.decl}\``, "", s.text, "");
    for (const c of s.code) {
      const snip: Snip = { id: id++, lang: c.lang || "ts", file: null, code: c.code, run: runKind(c.lang, c.code) };
      snips.push(snip);
      blocks.push({ t: "code", ...snip });
      md.push(`\`\`\`${snip.lang}`, c.code.trimEnd(), "```", "");
    }
  }
  const description = `Bun API reference from bun-types ${f}: ${sections.length} documented declarations with examples (${sections.slice(0, 6).map((s) => s.decl).join(", ")}${sections.length > 6 ? ", ..." : ""}).`.slice(0, 1024);
  pages[name] = { title: `Reference: ${base}`, description, section: "reference", tab: "Reference", group: f, source: `packages/bun-types/${f}`, parser: "jsdoc", blocks };
  snippets[name] = snips;
  skillsJson.skills.push({ name, source: `../packages/bun-types/${f}`, section: "reference", title: `Reference: ${base}`, description, components: [] });
  mkdirSync(join(app, "skills", name), { recursive: true });
  await Bun.write(join(app, "skills", name, "SKILL.md"), `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\n${md.join("\n")}\n`);
  total += snips.length;
  runnable += snips.filter((s) => s.run).length;
}
skillsJson.count = skillsJson.skills.length;
await Bun.write(join(app, "skills.json"), `${JSON.stringify(skillsJson, null, 2)}\n`);
await Bun.write(join(app, "pages.json"), `${JSON.stringify(pages)}\n`);
await Bun.write(join(app, "snippets.json"), `${JSON.stringify(snippets)}\n`);
console.log(JSON.stringify({ types: relative(app, types).replaceAll("\\", "/"), files: files.length, pages: Object.values(pages).filter((p: any) => p.tab === "Reference").length, examples: total, runnable }));
