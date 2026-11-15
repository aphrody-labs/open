import { describe, expect, test } from "bun:test";
import { DEFAULT_INSTALL } from "../src/engines/install.ts";
import { freePort } from "../src/engines/launch.ts";
import { ENGINES, getEngine } from "../src/engines/registry.ts";

describe("engines registry", () => {
  test("ids are unique", () => {
    const ids = ENGINES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every engine names its upstream as a URL", () => {
    for (const e of ENGINES) expect(() => new URL(e.upstream)).not.toThrow();
  });

  test("source builds read their output directory from the environment, never from a fixed path", () => {
    for (const e of ENGINES)
      if (e.install.via === "build" && e.install.outEnv) expect(e.install.outEnv).toMatch(/^BROWSER_ENGINES_[A-Z0-9_]+$/);
  });

  test("default install set only names known engines", () => {
    for (const id of DEFAULT_INSTALL) expect(() => getEngine(id)).not.toThrow();
  });

  test("CDP and WebDriver engines describe how to serve", () => {
    for (const e of ENGINES)
      if (e.protocol === "cdp" || e.protocol === "webdriver") {
        const argv = e.serve?.(9333, "profile") ?? [];
        expect(argv.join(" ")).toContain("9333");
      }
  });

  test("lightpanda: release binary through ay, CDP on loopback", () => {
    const e = getEngine("lightpanda");
    expect(e.install).toMatchObject({ via: "ay", tool: "lightpanda" });
    expect(e.serve?.(9333, "p")).toEqual(["serve", "--host", "127.0.0.1", "--port", "9333"]);
  });

  test("freePort returns a usable TCP port", () => {
    const p = freePort();
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(65536);
  });
});
