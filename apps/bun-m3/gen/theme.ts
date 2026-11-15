// Design system generated the way Material Theme Builder does it, from Bun's press kit: the source colour is
// extracted from the official icon (Celebi quantization + Score, material-color-utilities), then the Tonal Spot
// dynamic scheme is built for light and dark at standard, medium and high contrast. One export per framework:
// web CSS custom properties, Angular Material SCSS palettes, Flutter ColorScheme, Jetpack Compose ColorScheme,
// Android XML resources, Rust constants. Output: theme/.
// bun gen/theme.ts
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  argbFromRgb, DynamicScheme, Hct, hexFromArgb, MaterialDynamicColors, QuantizerCelebi, SchemeTonalSpot, Score, TonalPalette,
} from "@material/material-color-utilities";

const app = join(import.meta.dir, "..");
const out = join(app, "theme");
mkdirSync(out, { recursive: true });
const PRESS = "https://bun.com/press-kit";

// 1. press kit asset (the page lists the official icons; the 192 px PNG is the raster one Theme Builder can read)
const page = await (await fetch(PRESS)).text();
const iconUrl = [...page.matchAll(/(?:href|src)="([^"]+icon-192x192\.png)"/g)].map((m) => new URL(m[1]!, PRESS).href)[0];
if (!iconUrl) throw new Error(`no raster icon on ${PRESS}`);
const icon = new Uint8Array(await (await fetch(iconUrl)).arrayBuffer());
await Bun.write(join(out, "source-icon.png"), icon);

// 2. pixels: Bun.Image resizes and re-encodes to an uncompressed truecolor PNG; its IDAT stream is inflated with
// Bun.inflateSync and the scanline filters are undone here (PNG spec, filter types 0-4)
const png = await new Bun.Image(icon).resize(128, 128).png({ compressionLevel: 0 }).bytes();
const dv = new DataView(png.buffer, png.byteOffset, png.byteLength);
let width = 0, height = 0, colorType = 0, depth = 0;
const idat: Uint8Array[] = [];
for (let p = 8; p < png.length; ) {
  const len = dv.getUint32(p), type = String.fromCharCode(...png.subarray(p + 4, p + 8)), data = png.subarray(p + 8, p + 8 + len);
  if (type === "IHDR") { width = dv.getUint32(p + 8); height = dv.getUint32(p + 12); depth = png[p + 16]!; colorType = png[p + 17]!; }
  if (type === "IDAT") idat.push(data);
  p += 12 + len;
}
if (depth !== 8 || (colorType !== 6 && colorType !== 2)) throw new Error(`unexpected PNG: depth ${depth}, colour type ${colorType}`);
const channels = colorType === 6 ? 4 : 3;
const zlib = Buffer.concat(idat);
const raw = Bun.inflateSync(zlib.subarray(2, zlib.length - 4)); // strip the zlib header and Adler-32
const stride = width * channels;
const rows = new Uint8Array(height * stride);
for (let y = 0; y < height; y++) {
  const f = raw[y * (stride + 1)]!, src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), cur = rows.subarray(y * stride, (y + 1) * stride);
  const prev = y ? rows.subarray((y - 1) * stride, y * stride) : new Uint8Array(stride);
  for (let x = 0; x < stride; x++) {
    const a = x >= channels ? cur[x - channels]! : 0, b = prev[x]!, c = x >= channels ? prev[x - channels]! : 0;
    const pr = (() => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; })();
    cur[x] = (src[x]! + [0, a, b, (a + b) >> 1, pr][f]!) & 0xff;
  }
}
const pixels: number[] = [];
for (let i = 0; i < rows.length; i += channels) {
  if (channels === 4 && rows[i + 3]! < 255) continue; // Theme Builder ignores transparent pixels
  pixels.push(argbFromRgb(rows[i]!, rows[i + 1]!, rows[i + 2]!));
}

// 3. source colour exactly as Theme Builder (quantize to 128 colours, score, take the best)
const ranked = Score.score(QuantizerCelebi.quantize(pixels, 128));
const source = ranked[0]!;

// 4. schemes: light/dark x standard (0), medium (0.5), high (1) contrast
const modes = [
  { id: "light", dark: false, contrast: 0 }, { id: "light-medium-contrast", dark: false, contrast: 0.5 }, { id: "light-high-contrast", dark: false, contrast: 1 },
  { id: "dark", dark: true, contrast: 0 }, { id: "dark-medium-contrast", dark: true, contrast: 0.5 }, { id: "dark-high-contrast", dark: true, contrast: 1 },
];
const roleNames = Object.getOwnPropertyNames(MaterialDynamicColors)
  .filter((k) => (MaterialDynamicColors as any)[k]?.getArgb && !/palette|Key|highestSurface|background$/i.test(k) || ["background", "onBackground"].includes(k))
  .filter((k) => typeof (MaterialDynamicColors as any)[k]?.getArgb === "function");
const schemes: Record<string, Record<string, string>> = {};
for (const m of modes) {
  const s: DynamicScheme = new SchemeTonalSpot(Hct.fromInt(source), m.dark, m.contrast);
  schemes[m.id] = Object.fromEntries(roleNames.map((r) => [r, hexFromArgb((MaterialDynamicColors as any)[r].getArgb(s))]));
}
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const snake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const std = new SchemeTonalSpot(Hct.fromInt(source), false, 0);
const palettes: Record<string, TonalPalette> = { primary: std.primaryPalette, secondary: std.secondaryPalette, tertiary: std.tertiaryPalette, neutral: std.neutralPalette, "neutral-variant": std.neutralVariantPalette, error: std.errorPalette };
const tones = [0, 4, 6, 10, 12, 17, 20, 22, 24, 25, 30, 35, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100];

// 5. exports
const header = (c: string) => `${c} Generated by apps/bun-m3/gen/theme.ts from ${iconUrl} (source ${hexFromArgb(source)}, Tonal Spot). Do not edit.\n`;
const files: Record<string, string> = {};
files["web/theme.css"] = header("/*").replace(/\n$/, " */\n") + modes.map((m) =>
  `${m.id === "light" ? ":root, " : ""}.${m.id} {\n${Object.entries(schemes[m.id]!).map(([k, v]) => `  --md-sys-color-${kebab(k)}: ${v};`).join("\n")}\n}`).join("\n\n") + "\n@media (prefers-color-scheme: dark) { :root:not(.light) { color-scheme: dark; } }\n";
files["angular/_theme-colors.scss"] = header("//") + `@use 'sass:map';\n\n$_palettes: (\n${Object.entries(palettes).map(([n, p]) => `  ${n}: (\n${tones.map((t) => `    ${t}: ${hexFromArgb(p.tone(t))},`).join("\n")}\n  ),`).join("\n")}\n);\n\n$primary-palette: map.merge(map.get($_palettes, primary), (secondary: map.get($_palettes, secondary), neutral: map.get($_palettes, neutral), neutral-variant: map.get($_palettes, neutral-variant), error: map.get($_palettes, error)));\n$tertiary-palette: map.get($_palettes, tertiary);\n`;
const dartScheme = (id: string, dark: boolean) => `  static ColorScheme ${id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Scheme() {\n    return const ColorScheme(\n      brightness: Brightness.${dark ? "dark" : "light"},\n${Object.entries(schemes[id]!).filter(([k]) => !/^(background|onBackground)$/.test(k)).map(([k, v]) => `      ${k}: Color(0xff${v.slice(1)}),`).join("\n")}\n    );\n  }`;
files["flutter/theme.dart"] = header("//") + `import "package:flutter/material.dart";\n\nclass MaterialTheme {\n  const MaterialTheme();\n\n${modes.map((m) => dartScheme(m.id, m.dark)).join("\n\n")}\n}\n`;
files["compose/Color.kt"] = header("//") + `package com.aphrody.bunm3.theme\n\nimport androidx.compose.ui.graphics.Color\n\n${modes.map((m) => Object.entries(schemes[m.id]!).map(([k, v]) => `val ${k}${m.id.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join("")} = Color(0xFF${v.slice(1)})`).join("\n")).join("\n\n")}\n`;
files["compose/Theme.kt"] = header("//") + `package com.aphrody.bunm3.theme\n\nimport androidx.compose.material3.*\n\n${modes.map((m) => { const suf = m.id.split("-").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(""); return `val ${m.id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Scheme = ${m.dark ? "darkColorScheme" : "lightColorScheme"}(\n${Object.keys(schemes[m.id]!).filter((k) => !/^(background|onBackground)$/.test(k)).map((k) => `    ${k} = ${k}${suf},`).join("\n")}\n)`; }).join("\n\n")}\n`;
for (const m of modes) files[`android/values${m.dark ? "-night" : ""}${m.contrast === 0.5 ? "-v34-medium" : m.contrast === 1 ? "-v34-high" : ""}/colors.xml`] = `<?xml version="1.0" encoding="utf-8"?>\n<!-- ${header("").trim()} -->\n<resources>\n${Object.entries(schemes[m.id]!).map(([k, v]) => `    <color name="md_theme_${snake(k)}">${v.toUpperCase()}</color>`).join("\n")}\n</resources>\n`;
files["rust/tokens.rs"] = header("//") + modes.map((m) => `pub mod ${m.id.replace(/-/g, "_")} {\n${Object.entries(schemes[m.id]!).map(([k, v]) => `    pub const ${snake(k).toUpperCase()}: u32 = 0xFF${v.slice(1).toUpperCase()};`).join("\n")}\n}`).join("\n\n") + "\n";
files["theme.json"] = JSON.stringify({ source: hexFromArgb(source), sourceAsset: iconUrl, pressKit: PRESS, variant: "tonal-spot", pixels: pixels.length, candidates: ranked.slice(0, 4).map(hexFromArgb), schemes, palettes: Object.fromEntries(Object.entries(palettes).map(([n, p]) => [n, Object.fromEntries(tones.map((t) => [t, hexFromArgb(p.tone(t))]))])) }, null, 2) + "\n";
for (const [p, c] of Object.entries(files)) { mkdirSync(join(out, p, ".."), { recursive: true }); await Bun.write(join(out, p), c); }
console.log(`source ${hexFromArgb(source)} from ${pixels.length} opaque pixels; candidates ${ranked.slice(0, 4).map(hexFromArgb).join(" ")}; ${roleNames.length} roles x ${modes.length} modes; ${Object.keys(files).length} files`);
