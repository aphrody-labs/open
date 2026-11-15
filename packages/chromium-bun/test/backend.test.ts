import { expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pickBackend } from "../src/engines/backend.ts";

const dir = () => mkdtempSync(join(tmpdir(), "backend-"));

test("no need: the running Bun (JavaScriptCore)", () => {
  expect(pickBackend({ dir: dir(), env: {} })).toMatchObject({ from: "default", engine: { id: "javascriptcore" } });
});

test("needs select registry rows, channel included", () => {
  const p = pickBackend({ dir: dir(), env: {}, needs: { protocol: "cdp", channel: "canary" } });
  expect(p.engine.js).toBe("v8");
  expect(p.engine.id).toContain("canary");
  expect(pickBackend({ dir: dir(), env: {}, needs: { js: "spidermonkey" } }).engine.id).toBe("servo");
  expect(() => pickBackend({ dir: dir(), env: {}, needs: { channel: "nope" } })).toThrow();
});

test("detection from registry npm libraries, then engine file, env and argument win", () => {
  const d = dir();
  writeFileSync(join(d, "package.json"), JSON.stringify({ devDependencies: { "puppeteer-core": "1" } }));
  expect(pickBackend({ dir: d, env: {} })).toMatchObject({ from: "detected", engine: { protocol: "cdp" } });
  writeFileSync(join(d, ".engine-version"), "chrome@dev\n");
  expect(pickBackend({ dir: d, env: {} }).engine.id).toBe("chrome@dev");
  expect(pickBackend({ dir: d, env: { AY_BACKEND: "javascriptcore" } }).engine.id).toBe("javascriptcore");
  expect(pickBackend({ dir: d, env: { AY_BACKEND: "x" }, id: "chrome@beta" }).from).toBe("argument");
});
