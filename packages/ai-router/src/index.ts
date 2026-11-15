// Bun binding of the ai-router C ABI (crates/ai-router, include/ai_router.h) through bun:ffi. The library is
// AI_ROUTER_LIB, else the workspace build next to this package (target/release, then target/debug).
import { CString, dlopen, FFIType, JSCallback, type Pointer } from "bun:ffi";
import { existsSync } from "node:fs";
import { join } from "node:path";

const file = process.platform === "win32" ? "ai_router.dll" : process.platform === "darwin" ? "libai_router.dylib" : "libai_router.so";

export function libraryCandidates(): string[] {
  const target = join(import.meta.dir, "..", "..", "..", "target");
  return [process.env.AI_ROUTER_LIB, join(target, "release", file), join(target, "debug", file)].filter((p): p is string => !!p);
}

const symbols = {
  aphrody_abi_version: { args: [], returns: FFIType.u32 },
  aphrody_free: { args: [FFIType.ptr], returns: FFIType.void },
  aphrody_router_open: { args: [FFIType.cstring], returns: FFIType.ptr },
  aphrody_router_last_error: { args: [], returns: FFIType.ptr },
  aphrody_router_chat: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.ptr },
  aphrody_router_models: { args: [FFIType.ptr, FFIType.cstring], returns: FFIType.ptr },
  aphrody_router_chat_stream: { args: [FFIType.ptr, FFIType.cstring, FFIType.function, FFIType.ptr], returns: FFIType.ptr },
  aphrody_router_close: { args: [FFIType.ptr], returns: FFIType.void },
} as const;

type Lib = ReturnType<typeof dlopen<typeof symbols>>["symbols"];
let lib: Lib | null = null;

/** Loads the library once; null when no candidate exists. */
export function load(): Lib | null {
  if (lib) return lib;
  const path = libraryCandidates().find((p) => existsSync(p));
  if (!path) return null;
  lib = dlopen(path, symbols).symbols;
  return lib;
}

const z = (s: string) => Buffer.from(`${s}\0`, "utf8");

// bun:ffi types a returned pointer as Pointer | bigint | null; the router only returns real addresses
function take(l: Lib, p: Pointer | bigint | null): unknown {
  if (!p) throw new Error("ai-router returned no answer");
  try {
    return JSON.parse(new CString(p as Pointer).toString());
  } finally {
    l.aphrody_free(p as Pointer);
  }
}

export interface RouterConfig {
  catalog_url?: string;
  catalog?: unknown;
  local?: string[];
  max_attempts?: number;
  timeout_s?: number;
}

export interface Offer {
  provider: string;
  model: string;
  name: string;
  protocol: "open-ai" | "anthropic" | "google";
  local: boolean;
  cost_in: number;
  cost_out: number;
  context: number;
}

export class Router implements Disposable {
  #lib: Lib;
  #handle: Pointer;

  constructor(config: RouterConfig = {}) {
    const l = load();
    if (!l) throw new Error(`ai-router library not found (set AI_ROUTER_LIB; tried ${libraryCandidates().join(", ")})`);
    const h = l.aphrody_router_open(z(JSON.stringify(config)));
    if (!h) throw new Error(String((take(l, l.aphrody_router_last_error()) as { error?: string }).error ?? "open failed"));
    this.#lib = l;
    this.#handle = h as Pointer;
  }

  /** OpenAI chat-completions request in, chat.completion document out (with `router.offer` and `router.attempts`). */
  chat(request: { model?: string; messages: { role: string; content: unknown }[]; [k: string]: unknown }): Record<string, any> {
    return take(this.#lib, this.#lib.aphrody_router_chat(this.#handle, z(JSON.stringify(request)))) as Record<string, any>;
  }

  /** Streams the answer: `onChunk` receives each chat.completion.chunk as it arrives; returns the router summary. */
  chatStream(request: { model?: string; messages: { role: string; content: unknown }[]; [k: string]: unknown }, onChunk: (chunk: Record<string, any>) => void): Record<string, any> {
    const cb = new JSCallback((p: Pointer) => onChunk(JSON.parse(new CString(p).toString())), { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.void });
    try {
      return take(this.#lib, this.#lib.aphrody_router_chat_stream(this.#handle, z(JSON.stringify(request)), cb, null)) as Record<string, any>;
    } finally {
      cb.close();
    }
  }

  /** Usable offers for a policy (auto, auto:local, auto:free, auto:cheap) or an offer id, in trial order. */
  models(model = "auto"): Offer[] {
    return take(this.#lib, this.#lib.aphrody_router_models(this.#handle, z(model))) as Offer[];
  }

  [Symbol.dispose]() {
    this.#lib.aphrody_router_close(this.#handle);
  }
}
