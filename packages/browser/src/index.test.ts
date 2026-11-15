import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  LP_ABI_VERSION,
  loadBrowserCore,
  lpCapabilities,
  lpExtractTitle,
  lpNormalizeUrl,
} from "./index";

test("lightpanda browser_capi FFI or TypeScript fallback", () => {
  const dll = join(
    import.meta.dir,
    "..",
    "native",
    "zig-out",
    "bin",
    process.platform === "win32" ? "browser_capi.dll" : "libbrowser_capi.so",
  );
  const loaded = loadBrowserCore();
  if (existsSync(dll)) {
    expect(loaded).not.toBeNull();
    expect(loaded!.lib.symbols.lp_abi_version()).toBe(LP_ABI_VERSION);
  }

  const caps = lpCapabilities();
  expect(caps.abi).toBe(LP_ABI_VERSION);
  expect(caps.features).toContain("extract_title");
  expect(
    lpExtractTitle("<html><head><Title> Example </title></head></html>"),
  ).toBe("Example");
  expect(lpNormalizeUrl("example.com/docs")).toBe("https://example.com/docs");
  expect(lpNormalizeUrl("https://example.com")).toBe("https://example.com");
});
