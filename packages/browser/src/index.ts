// Lightpanda headless browser core through its C ABI (lp_*) and bun:ffi; the library is BROWSER_LIB or the package's own
// native build. Without it, title extraction and URL normalisation run in TypeScript.
import { CString, FFIType, dlopen, ptr, suffix, type Pointer } from "bun:ffi";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const LP_ABI_VERSION = 1;
export const BROWSER_LIB_FILE = `${process.platform === "win32" ? "" : "lib"}browser_capi.${suffix}`;

const symbols = {
  lp_abi_version: { args: [], returns: FFIType.u32 },
  lp_free: { args: [FFIType.ptr], returns: FFIType.void },
  lp_capabilities_json: { args: [], returns: FFIType.ptr },
  lp_extract_title_json: { args: [FFIType.ptr], returns: FFIType.ptr },
  lp_normalize_url_json: { args: [FFIType.ptr], returns: FFIType.ptr },
} as const;

type BrowserLib = ReturnType<typeof dlopen<typeof symbols>>;

const cstr = (s: string) => ptr(Buffer.from(`${s}\0`, "utf8"));

export function browserLibCandidates(): string[] {
  const pkgRoot = join(import.meta.dir, "..");
  return [
    process.env.BROWSER_LIB,
    join(pkgRoot, "native", "zig-out", "bin", BROWSER_LIB_FILE),
    join(pkgRoot, "native", "zig-out", "lib", BROWSER_LIB_FILE),
    join(homedir(), ".local", "bin", BROWSER_LIB_FILE),
  ].filter((p): p is string => Boolean(p));
}


let cached: { lib: BrowserLib; path: string } | null | undefined;

export function loadBrowserCore(): { lib: BrowserLib; path: string } | null {
  if (cached !== undefined) return cached;
  for (const p of browserLibCandidates()) {
    if (!existsSync(p)) continue;
    try {
      const lib = dlopen(p, symbols);
      if (lib.symbols.lp_abi_version() !== LP_ABI_VERSION) {
        lib.close();
        continue;
      }
      cached = { lib, path: p };
      return cached;
    } catch {
      // try next candidate
    }
  }
  cached = null;
  return null;
}

function takeJson<T>(lib: BrowserLib, p: Pointer | bigint | null): T {
  if (!p) throw new Error("browser_capi returned null pointer");
  const ptrVal = p as Pointer;
  try {
    return JSON.parse(new CString(ptrVal).toString()) as T;
  } finally {
    lib.symbols.lp_free(ptrVal);
  }
}

export function lpCapabilities(): {
  native: boolean;
  abi: number;
  engine: string;
  v8: string;
  features: string[];
} {
  const loaded = loadBrowserCore();
  if (!loaded) {
    return {
      native: false,
      abi: LP_ABI_VERSION,
      engine: "ts-fallback",
      v8: "none",
      features: ["extract_title", "normalize_url"],
    };
  }
  const j = takeJson<{
    abi: number;
    engine: string;
    v8: string;
    features: string[];
  }>(loaded.lib, loaded.lib.symbols.lp_capabilities_json());
  return { native: true, ...j };
}

export function lpExtractTitle(html: string): string {
  const loaded = loadBrowserCore();
  if (loaded) {
    return takeJson<{ title: string }>(
      loaded.lib,
      loaded.lib.symbols.lp_extract_title_json(cstr(html)),
    ).title;
  }
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return m?.[1]?.trim() ?? "";
}

export function lpNormalizeUrl(url: string): string {
  const loaded = loadBrowserCore();
  if (loaded) {
    return takeJson<{ url: string }>(
      loaded.lib,
      loaded.lib.symbols.lp_normalize_url_json(cstr(url)),
    ).url;
  }
  const t = url.trim();
  if (!t || t.includes("://")) return t;
  return `https://${t}`;
}
