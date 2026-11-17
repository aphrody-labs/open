import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listSkills, readSkill } from "../src/skills-mcp.ts";

// A directory of Agent Skills: folders holding a SKILL.md with name and description in its YAML front matter.
let root: string;
beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "skills-"));
  mkdirSync(join(root, "datasets"));
  writeFileSync(join(root, "datasets", "SKILL.md"), "---\nname: demo-datasets\ndescription: \"Query a Dataset Viewer\"\n---\nUse the viewer.\n");
  writeFileSync(join(root, "datasets", "extra.md"), "extra notes\n");
  mkdirSync(join(root, "cli"));
  writeFileSync(join(root, "cli", "SKILL.md"), "---\ndescription: Drive the hub CLI\n---\nRun it.\n");
  mkdirSync(join(root, "not-a-skill"));
});
afterAll(() => rmSync(root, { recursive: true, force: true }));

test("lists the skills with their names and descriptions", () => {
  const skills = listSkills(root);
  expect(skills.map((s) => s.folder).sort()).toEqual(["cli", "datasets"]);
  expect(skills.find((s) => s.folder === "datasets")).toEqual({ name: "demo-datasets", folder: "datasets", description: "Query a Dataset Viewer" });
  // no name in the front matter: the folder name
  expect(skills.find((s) => s.folder === "cli")?.name).toBe("cli");
});

test("reads a skill and a file of its folder, and refuses paths outside it", () => {
  expect(readSkill("demo-datasets", "SKILL.md", root)).toContain("name: demo-datasets");
  expect(readSkill("datasets", "extra.md", root)).toBe("extra notes\n");
  expect(readSkill("datasets", "../cli/SKILL.md", root)).toBeNull();
  expect(readSkill("no-such-skill", "SKILL.md", root)).toBeNull();
});

test("without a directory the error says how to give one", () => {
  expect(() => listSkills("")).toThrow("SKILLS_DIR");
});
