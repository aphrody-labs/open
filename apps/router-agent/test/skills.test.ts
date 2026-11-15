import { expect, test } from "bun:test";
import { listSkills, readSkill } from "../src/skills-mcp.ts";

test("lists the absorbed Hugging Face skills with their descriptions", () => {
  const skills = listSkills();
  expect(skills.length).toBeGreaterThan(10);
  expect(skills.find((s) => s.name === "huggingface-datasets")?.description).toContain("Dataset Viewer");
});

test("reads a skill and refuses paths outside its folder", () => {
  expect(readSkill("huggingface-datasets")).toContain("name: huggingface-datasets");
  expect(readSkill("huggingface-datasets", "../hf-cli/SKILL.md")).toBeNull();
  expect(readSkill("no-such-skill")).toBeNull();
});
