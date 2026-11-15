import { expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BACKENDS, USE_CASES, getBackend, pickBackend } from "../src/engines/backend.ts";
import { getEngine } from "../src/engines/registry.ts";

const dir = () => mkdtempSync(join(tmpdir(), "backend-"));

test("every backend engine and use case resolves", () => {
  for (const b of BACKENDS) if (b.engine) expect(getEngine(b.engine).js).toBe("v8");
  for (const u of Object.values(USE_CASES)) expect(getBackend(u.backend).id).toBe(u.backend);
});

test("resolution order: argument, env, engine file, use case, detection", () => {
  const d = dir();
  expect(pickBackend({ dir: d, env: {} }).backend.id).toBe("bun");
  writeFileSync(join(d, "package.json"), JSON.stringify({ devDependencies: { playwright: "1" } }));
  expect(pickBackend({ dir: d, env: {} })).toMatchObject({ from: "detected", useCase: "automation" });
  expect(pickBackend({ dir: d, env: {}, useCase: "canary" }).backend.id).toBe("chromium@canary");
  writeFileSync(join(d, ".engine-version"), "chromium@dev\n");
  expect(pickBackend({ dir: d, env: {}, useCase: "canary" }).backend.id).toBe("chromium@dev");
  expect(pickBackend({ dir: d, env: { AY_BACKEND: "bun" } }).backend.id).toBe("bun");
  expect(pickBackend({ dir: d, env: { AY_BACKEND: "bun" }, id: "chromium@stable" }).from).toBe("argument");
});

test("engine file with a browser id (ay rt) is not a backend", () => {
  const d = dir();
  writeFileSync(join(d, ".engine-version"), "obscura\n");
  expect(pickBackend({ dir: d, env: {} }).backend.id).toBe("bun");
  expect(() => pickBackend({ dir: d, env: {}, useCase: "nope" })).toThrow();
});
