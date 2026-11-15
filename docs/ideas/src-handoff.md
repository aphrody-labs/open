# Passation depuis src (session src-2d)

Ce que `aphrody-labs/aphrody` (C:\src) contient dans le périmètre d'`open` (UI, TUI, GUI, Material 3 desktop et mobile, crawl, moteurs de navigateur, routage et inférence IA). La session src-2d n'étend plus rien de ceci dans src ; chaque ligne dit où reprendre. Les références sont des commits de src.

## UI web et Material 3

| Élément | État dans src | Commit | À reprendre dans open |
|---|---|---|---|
| Material Web (`@material/web`) | retiré : en maintenance (README cherche des mainteneurs, non archivé, dernier push 2026-11-13 lu sur l'API GitHub) ; seuls consommateurs = deux composants morts d'`apps/auto` | 406ccf22, 64e76a49 | ne pas le réintroduire (D3) |
| Angular + Angular Material | catalogue racine en `22.3.0-rc.0` (tag npm `next` lu en direct) ; `apps/aphrody/web` construit sur fr2 en 4,6 s | 1c4cd2d8, 7b86d5fc | base du fork Angular de D3 |
| Thème M3 Angular | `packages/design` : `mat.theme` Sass + `--mat-sys-*` générés depuis les tokens MCU (`assets/brand/brand.toml`) ; tokens officiels Google lus en direct | 64e76a49, 63c1430b | source D14 ; `tokens.json` en dérive tant que `brand.toml` (session en cours) n'est pas commité |
| Couleur M3 en C | `ui/hct.c` (CAM16, HctSolver, schémas dynamiques), `m3.c` | b79d6f6b | candidat pour l'ABI C partagée de D3 |
| Revue modern-web-guidance | gnu.aphrody.com : liens limités à http(s), onglets ARIA, recherche différée (INP) ; télémétrie M3 en `textContent` ; aperçu de logo d'auto sans décalage | a4840899, 8aae9606 | appliquer les mêmes règles aux surfaces d'open |

## Desktop

| Élément | État | Commit | À reprendre |
|---|---|---|---|
| Migrateur Electron | `ay electron` (analyze, migrate, optimize, bench), générateurs Tauri v3 et GPUI, sidecar Bun, skill `electron-migrate`, serveur MCP relay | 3f977662, 0150f70a, 275ff359, 7847d118, 1b3ea84f | note déjà dans `roadmap` (e32d1e957 d'open) ; gelé dans src |
| Tests desktop Gemini | inventaire de l'app Gemini 1.19.0, suite e2e (agent-desktop, rea, ghidra, agent-browser), `just e2e-desktop` | a9ee94ac | réutilisable pour les preuves desktop d'open |

## Mobile

| Élément | État | Commit | À reprendre |
|---|---|---|---|
| Chaîne Android | `infra/android/android.toml` (Studio, JDK, NDK, SDK, Kotlin résolus), Android 18 = canary API 37.2 seulement | 758de936 | base de Compose Multiplatform (D4) |
| `apps/android-shell` | app Compose Material 3 prouvée sur l'émulateur API 37 (layout + capture), `types.h` compatible bionic | 758de936 | à migrer vers open ; Compose BOM = dernière publiée au moment du relevé (maven-metadata Google) |

## Moteurs de navigateur et crawl

| Élément | État | Commit | À reprendre |
|---|---|---|---|
| Chromium third_party | réorganisé comme l'amont, trackers (canaux, CEF, Skia, Blink, cef-rs, deno_core, V8 de node/electron/obscura, agent-browser, Lightpanda zig-v8) | voir `third_party/chrome-channels.toml`, skill `chromium` | browser-and-crawl.md |
| Lightpanda | `ay up` installe la release épinglée, `packages/browser/native` synchronisé sur lightpanda-io/browser main | 49db7cf8, 9e9e6de2, 0ac9ff5b | plan Windows de la roadmap d'open |
| Backends `ay engines` | bascule bun (JSC) ou chromium par canal | 4d754ef5 | moteurs (D6) |
| Miroir de sites | `tools/site-mirror` : rendu de chaque page de sitemap (Chromium, Firefox, WebKit), DOM et réponses réseau | 85906b13 | archive de référence (D6) |

## IA : routage et passerelles

| Élément | État | Commit | À reprendre |
|---|---|---|---|
| Routeur, `ay-chat`, `ay-chat-gui` | retirés de src par la session apps-4d | 2c058770 | déjà dans open (ai-router.md) |
| Passerelle MCP Gemini web | Worker `mcp.aphrody.com` avec OAuth, relay fr2 (82 outils), archive de skills ; le flux OAuth complet attend le consentement Google du propriétaire | session src-2d | à rattacher au routage (D2, D10) |

## Règles apprises (src-2d)

- Aucune version, date ou liste en dur : résolution en direct (API releases, npm dist-tags, maven-metadata, gitiles) ; `just hygiene` de src le vérifie.
- « Fini » = dernière version amont, construit, testé, en service, livré en skill + MCP, hygiène verte (`docs/native/ROADMAP.md` de src).
- Les vrais imports avant toute affirmation de dépendance : `rg` sur les imports et les manifestes, puis le graphe, jamais un nom de paquet seul.
