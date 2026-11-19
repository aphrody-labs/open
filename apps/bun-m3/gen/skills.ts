// MDX -> Agent Skills. Reads every .mdx under the Bun fork docs and writes one skill per page:
// skills/<name>/SKILL.md (YAML frontmatter `name`, `description`, then the page as Markdown) and skills.json
// (index: name, source path, title, description, MDX components used). Conversion is deterministic: imports and
// exports are dropped, the docs' JSX components become Markdown (callouts, tab and step headings, lists).
// bun gen/skills.ts [--docs <dir>]
import { mkdirSync, rmSync } from "node:fs";
import { join, relative } from "node:path";

const app = join(import.meta.dir, "..");
const argv = Bun.argv.slice(2);
const docs = argv.includes("--docs") ? argv[argv.indexOf("--docs") + 1]! : join(app, "../../.cache/bun-fork/docs");
const out = join(app, "skills");

/** Agent Skills `name`: lowercase letters, digits and hyphens, at most 64 characters. */
const skillName = (rel: string) =>
  `bun-${rel.replace(/\.mdx?$/, "").replace(/(^|\/)index$/, "") || "docs-index"}`
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64).replace(/-$/, "");

function frontmatter(src: string): { fm: Record<string, string>; body: string } {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: src };
  const fm: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) fm[kv[1]!] = kv[2]!.replace(/^["']|["']$/g, "").trim();
  }
  return { fm, body: src.slice(m[0].length) };
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}=["{]([^"}]*)["}]`))?.[1];

/** JSX components of the Bun docs -> Markdown. Unknown components keep their inner content. */
function toMarkdown(body: string) {
  let s = body
    .replace(/^(import|export)\s[^\n]*\n/gm, "")
    .replace(/<(Note|Info|Tip|Warning|Check|Danger)>\s*/g, (_, k) => `> **${k}**\n>\n> `)
    .replace(/\s*<\/(Note|Info|Tip|Warning|Check|Danger)>/g, "\n")
    .replace(/<Tab\b([^>]*)>/g, (_, a) => `\n#### ${attr(a, "title") ?? "Tab"}\n`)
    .replace(/<Step\b([^>]*)>/g, (_, a) => `\n#### Step: ${attr(a, "title") ?? ""}\n`)
    .replace(/<Accordion\b([^>]*)>/g, (_, a) => `\n#### ${attr(a, "title") ?? "Details"}\n`)
    .replace(/<Card\b([^>]*?)\/?>/g, (_, a) => `\n- ${attr(a, "href") ? `[${attr(a, "title") ?? attr(a, "href")}](${attr(a, "href")})` : (attr(a, "title") ?? "")}\n`)
    .replace(/<ParamField\b([^>]*?)\/?>/g, (_, a) => {
      const name = ["path", "query", "body", "header", "param"].map((k) => attr(a, k)).find(Boolean) ?? "";
      return `\n- \`${name}\`${attr(a, "type") ? ` (${attr(a, "type")})` : ""}${/required/.test(a) ? ", required" : ""}${attr(a, "default") ? `, default \`${attr(a, "default")}\`` : ""}: `;
    })
    .replace(/<\/?[A-Z][A-Za-z.]*\b[^>]*>/g, "");
  s = s.replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

const files = [...new Bun.Glob("**/*.mdx").scanSync({ cwd: docs })].sort();
rmSync(out, { recursive: true, force: true });
const index = [];
const seen = new Map<string, string>();
for (const f of files) {
  const rel = f.replaceAll("\\", "/");
  const src = await Bun.file(join(docs, rel)).text();
  const { fm, body } = frontmatter(src);
  let name = skillName(rel);
  if (seen.has(name)) name = `${name.slice(0, 58)}-${Bun.hash(rel).toString(36).slice(0, 5)}`;
  seen.set(name, rel);
  const title = fm.title ?? rel;
  const components = [...new Set([...body.matchAll(/<([A-Z][A-Za-z]+)\b/g)].map((m) => m[1]!))].sort();
  const description = `${(fm.description || title).replace(/[.\s]+$/, "")}. Use when working with Bun: ${title} (bun docs ${rel}).`.replace(/\s+/g, " ").slice(0, 1024);
  const skill = `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\n# ${title}\n\n${toMarkdown(body)}\n`;
  mkdirSync(join(out, name), { recursive: true });
  await Bun.write(join(out, name, "SKILL.md"), skill);
  index.push({ name, source: rel, section: rel.split("/")[0], title, description: fm.description ?? null, components });
}
await Bun.write(join(app, "skills.json"), `${JSON.stringify({ source: relative(app, docs).replaceAll("\\", "/"), count: index.length, skills: index }, null, 2)}\n`);
console.log(`${index.length} skills from ${files.length} MDX files`);
