// Bun API surface, read from bun-types with the TypeScript checker: every export of the `bun` module and of the
// `bun:*` modules (namespace members flattened as `Bun.x.y`). Output: api.json, the reference list the coverage
// proof is measured against.
// bun gen/api.ts [--types <bun-types dir>]
import { join } from "node:path";
import ts from "typescript";

const app = join(import.meta.dir, "..");
const argv = Bun.argv.slice(2);
const types = argv.includes("--types") ? argv[argv.indexOf("--types") + 1]! : join(app, "../../.cache/bun-fork/packages/bun-types");
const program = ts.createProgram([join(types, "index.d.ts")], { noEmit: true, skipLibCheck: true, types: [], lib: ["lib.esnext.d.ts", "lib.dom.d.ts"].map((l) => l) });
const checker = program.getTypeChecker();

const modules = ["bun", "bun:sqlite", "bun:ffi", "bun:jsc", "bun:test", "bun:bundle"];
const out: { module: string; name: string; kind: string; file: string }[] = [];
const kindOf = (s: ts.Symbol) => {
  const f = s.flags;
  return f & ts.SymbolFlags.Function ? "function" : f & ts.SymbolFlags.Class ? "class" : f & ts.SymbolFlags.Variable ? "variable"
    : f & ts.SymbolFlags.Namespace ? "namespace" : f & ts.SymbolFlags.Interface ? "interface" : f & ts.SymbolFlags.TypeAlias ? "type"
    : f & ts.SymbolFlags.Enum ? "enum" : "other";
};
const fileOf = (s: ts.Symbol) => (s.declarations?.[0]?.getSourceFile().fileName ?? "").replace(/\\/g, "/").split("/bun-types/")[1] ?? "";

function walk(module: string, prefix: string, sym: ts.Symbol, depth: number) {
  const target = sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
  const kind = kindOf(target);
  out.push({ module, name: prefix, kind, file: fileOf(target) });
  if (depth > 2 || !(target.flags & ts.SymbolFlags.Namespace)) return;
  for (const m of checker.getExportsOfModule(target)) walk(module, `${prefix}.${m.name}`, m, depth + 1);
}

for (const mod of modules) {
  const decl = program.getSourceFiles().flatMap((sf) => sf.statements)
    .find((s) => ts.isModuleDeclaration(s) && ts.isStringLiteral(s.name) && s.name.text === mod) as ts.ModuleDeclaration | undefined;
  const sym = decl && checker.getSymbolAtLocation(decl.name);
  if (!sym) { console.log(`missing module ${mod}`); continue; }
  for (const e of checker.getExportsOfModule(sym)) {
    if (e.name === "default") continue;
    walk(mod, mod === "bun" ? `Bun.${e.name}` : `${mod}:${e.name}`, e, 0);
  }
}

// value-level APIs only: what a program can call or construct (types and interfaces are not "used")
const values = out.filter((o) => ["function", "class", "variable", "namespace", "enum"].includes(o.kind));
const byModule = Object.fromEntries(modules.map((m) => [m, values.filter((v) => v.module === m).length]));
await Bun.write(join(app, "api.json"), `${JSON.stringify({ source: "bun-types (aphrody-labs/bun)", byModule, values, all: out.length }, null, 2)}\n`);
console.log(`${values.length} value APIs (${out.length} exports incl. types)`, JSON.stringify(byModule));
