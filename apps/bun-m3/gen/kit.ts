// Inventory of the Figma "Material 3 Design Kit" library: kit/figma-search.json holds the raw answer of the Figma
// MCP search_design_system for the 36 M3 components of m3.material.io (one query per component). This script
// dedupes the matched assets by key and maps every M3 component to its kit assets. Output: kit/kit.json.
// bun gen/kit.ts
import { join } from "node:path";

const app = join(import.meta.dir, "..");
const raw = await Bun.file(join(app, "kit/figma-search.json")).json();
const assets = new Map<string, { key: string; name: string; type: string; path: string; updated: string; queries: string[] }>();
const byComponent: Record<string, string[]> = {};
for (const r of raw.results) {
  byComponent[r.query] = [];
  for (const c of r.components ?? []) {
    if (c.libraryName !== "Material 3 Design Kit") continue;
    const key = c.componentSetKey ?? c.componentKey ?? c.key;
    const e = assets.get(key) ?? { key, name: c.name, type: c.assetType, path: c.filePath, updated: c.updatedAt, queries: [] };
    e.queries.push(r.query);
    assets.set(key, e);
    byComponent[r.query]!.push(c.name);
  }
}
const list = [...assets.values()].sort((a, b) => a.path.localeCompare(b.path));
// the kit names the floating action button "FAB": a query answered by its alias is not missing
const alias: Record<string, string> = { "floating action button": "FAB" };
const missing = Object.entries(byComponent).filter(([k, v]) => v.length === 0 && !(byComponent[alias[k] ?? ""]?.length)).map(([k]) => k);
await Bun.write(join(app, "kit/kit.json"), `${JSON.stringify({ library: "Material 3 Design Kit (Figma community)", queries: Object.keys(byComponent).length, assets: list.length, componentSets: list.filter((a) => a.type === "component_set").length, missing, byComponent, list }, null, 2)}\n`);
console.log(`${list.length} kit assets (${list.filter((a) => a.type === "component_set").length} component sets) for ${Object.keys(byComponent).length} M3 components; without match: ${missing.join(", ") || "none"}`);
