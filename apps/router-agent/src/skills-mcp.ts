// MCP server (stdio) over a directory of Agent Skills (folders holding a SKILL.md with name and description in its
// YAML front matter): list_skills gives every name and description, read_skill gives one skill's instructions or a
// file inside its folder. The agent reads a skill only when its task needs it.
// bun src/skills-mcp.ts --dir <skills directory>   (or SKILLS_DIR; for example the skills/ folder of a checkout of huggingface/skills)
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, normalize, sep } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const argv = Bun.argv.slice(2);
const dir = argv.includes("--dir") ? argv[argv.indexOf("--dir") + 1]! : Bun.env.SKILLS_DIR;

export function listSkills(root = dir) {
  if (!root) throw new Error("no skills directory: pass --dir <path> or set SKILLS_DIR");
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(root, d.name, "SKILL.md")))
    .map((d) => {
      const fm = readFileSync(join(root, d.name, "SKILL.md"), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
      const field = (k: string) => fm.match(new RegExp(`^${k}:\\s*(.*)$`, "m"))?.[1]?.replace(/^["']|["']$/g, "").trim() ?? "";
      return { name: field("name") || d.name, folder: d.name, description: field("description") };
    });
}

export function readSkill(name: string, file = "SKILL.md", root = dir) {
  const s = listSkills(root).find((x) => x.name === name || x.folder === name);
  if (!s) return null;
  const base = join(root, s.folder);
  const path = normalize(join(base, file));
  // a file inside the skill's own folder only
  if (!path.startsWith(base + sep) && path !== join(base, "SKILL.md")) return null;
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

if (import.meta.main) {
  const server = new McpServer({ name: "skills", version: "1.0.0" });
  server.registerTool("list_skills", { description: "List the available skills: name and when to use each one." }, async () => ({
    content: [{ type: "text", text: listSkills().map((s) => `${s.name}: ${s.description}`).join("\n") }],
  }));
  server.registerTool(
    "read_skill",
    { description: "Read a skill's instructions (SKILL.md) or a file inside its folder, before doing the task it covers.", inputSchema: { name: z.string(), file: z.string().optional() } },
    async ({ name, file }) => {
      const text = readSkill(name, file ?? "SKILL.md");
      return { content: [{ type: "text", text: text ?? `no skill or file ${name}/${file ?? "SKILL.md"}` }], isError: text == null };
    },
  );
  await server.connect(new StdioServerTransport());
}
