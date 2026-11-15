# Navigateurs, moteurs et crawl

Objectif évoqué : capturer et mirrorer intégralement design.google et m3.material.io (HTML, CSS, JS, polices, images, vidéo, appels réseau), avec captures d'écran de chaque page, pour servir de source réelle.

## Pourquoi un vrai navigateur

Sur `m3.material.io/components/buttons/overview`, `curl` reçoit 62 Ko dont 9 mots visibles ; le DOM rendu en contient 460. Les pages sont construites en JavaScript. Un premier passage a aussi vu 276 requêtes `fetch` et 425 `xhr`.

Plans de site : m3.material.io publie un sitemap (375 URL) ; design.google aussi. robots.txt : design.google interdit `/api/` ; m3 interdit `/archive`, `/search.html` et les URL de recherche ou de tracking.

## Dépendances réelles (lues dans les manifestes et le code)

| Outil | Moteur JS | Rendu graphique | Client CDP | Navigateur piloté |
|---|---|---|---|---|
| Playwright | celui du navigateur | celui du navigateur | interne | Chromium = build Chrome for Testing servi par `cdn.playwright.dev` ; Firefox et WebKit en révisions propres à Playwright |
| Puppeteer | idem | idem | interne | Chrome for Testing (`storage.googleapis.com/chrome-for-testing-public`) |
| agent-browser | idem | idem | client Rust maison (`tokio-tungstenite`), sans Playwright | Chrome for Testing ; modules Lightpanda et Obscura |
| Obscura | V8 via `deno_core` | moteur maison (html5ever, taffy, tiny-skia), polices embarquées | serveur CDP maison | aucun |
| Lightpanda | V8 (fork zig-v8), réseau curl + BoringSSL + nghttp2 | aucun : capture PNG en rendu texte ; domaine CSS limité à 2 méthodes | serveur CDP (port 9222) | aucun |
| Crawlee (JS) | — | — | — | `playwright` en dépendance pair ; navigateur distant par `remoteBrowser` |
| Crawlee (Python) | — | — | — | extra `playwright`, empreintes `browserforge`, HTTP `impit` / `curl-cffi` |
| anomalyco/browse | — | — | — | pilote les onglets avec Playwright ; serveur MCP + extension Chromium |

Doc Playwright : `connectOverCDP` ne fonctionne qu'avec Chromium et offre une fidélité « significantly lower » que son protocole propre.

## Inventaire complet

- Moteurs : Chrome for Testing, Chromium, WebKit, Firefox, Servo (WebDriver classique seulement), Blitz, Obscura, Lightpanda, Ladybird, Brave, ungoogled-chromium.
- Pilotes : Playwright, Puppeteer, Selenium, WebDriver BiDi, Chrome DevTools Protocol, agent-browser, chrome-devtools-mcp, playwright-mcp, browser-use, Stagehand.
- Crawlers : Crawlee (JS, Python), Scrapy (+ scrapy-playwright), crawl4ai, Firecrawl, katana, Apify (CLI, SDK, acteurs).
- Archivage : browsertrix-crawler (WARC/WACZ), pywb (relecture), single-file-cli, monolith, httrack, wget2.
- Réseau : mitmproxy (HAR, API).
- Extraction : markitdown, trafilatura, readability, Jina Reader.
- Services : Cloudflare Browser Run `/crawl` (découverte, rendu, HTML/Markdown/JSON), browserless, steel-browser.

## Pipeline proposée

1. Découverte : sitemaps, katana, Crawlee (file, reprises, limites robots).
2. Rendu de référence : Chrome for Testing (agent-browser) ; trace réseau complète.
3. Archive fidèle : browsertrix-crawler en WACZ, relu par pywb ; single-file par page.
4. Comparaison : Obscura, Lightpanda, WebKit sur le même lot (DOM, réseau).
5. Contenu : markitdown, trafilatura.
6. Liaison au code : chaque composant M3 relié à son implémentation (angular/components, androidx, flutter) et au kit Figma.

Erreur à ne pas refaire : un premier mirror a été écrit sur Playwright seul, sans justification, avec un seul moteur.
