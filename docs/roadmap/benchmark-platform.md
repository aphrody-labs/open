# `open` comme banc d'essai automatisé (demande du propriétaire)

## Ce qui est demandé

1. **Inventaires**
   - Frameworks Rust équivalents à Flutter, Jetpack Compose et Angular ; idem pour Next.js, shadcn/ui, Base UI, Better Auth et Tailwind CSS.
   - Monorepo Aphrody complet : third party, first party et documentation.
2. **Outils installés globalement sur chaque hôte (PC et VPS)** : tree-sitter, Helix, Magika, markitdown, Obscura, Lightpanda, Crawlee, Apify, hyperfine (fork), et le reste de l'inventaire navigateurs et crawl.
3. **Banc d'essai** : chaque outil testé sur son propre site, sur design.google et sur m3.material.io.
4. **Une seule base de résultats** : SQLite, Redis, JSON et MDX ; reprise après interruption ; plusieurs hôtes.
5. **Réseau et stockage** : tunnel Cloudflare, bucket R2, Worker, Pages, DNS ; pilotage par CDP ; flux de résultats en streaming ; mesures hyperfine.
6. **Navigateur ↔ UI, dans les deux sens et de façon récursive** : d'un sitemap, générer au pixel près une application full-stack dans un framework ; rendre l'application générée, la comparer à l'original, recommencer.

## Exigences

- R17. Les inventaires sont produits par des scripts dans `open` depuis des sources interrogeables (API GitHub, manifestes, locks), avec la requête de provenance ; aucune liste tenue à la main.
- R18. L'installation des outils est reproductible et idempotente sur chaque hôte.
- R19. Chaque exécution du banc enregistre outil, version, hôte, cible, mesures, artefacts ; elle reprend là où elle s'est arrêtée.
- R20. La génération sitemap → application est jugée par différence de pixels et de DOM contre le rendu de référence (Chrome for Testing).
- R21. Outil sans build pour une plateforme (ex. Lightpanda sous Windows) : fork, patch, push, release, puis distribution par `ay` et le téléchargement Aphrody avec mise à jour automatique. Outil inexistant : on le crée selon les pratiques des frameworks, des grands clouds, des stores et des gestionnaires de paquets.

## Premier cas R21 : Lightpanda sous Windows

La PR amont lightpanda-io/browser#3753 (« native Windows support », 26 fichiers, +1436/-108, ouverte) remplit le `WindowsIO` laissé vide dans `Server.zig` et adapte `build.zig` (MSVC, SDK Windows, bibliothèques système). Plan : l'appliquer sur `aphrody-labs/browser`, construire, tester, publier une release Windows, l'ajouter à `scripts/hosts/tools.json`.

## Phases ajoutées

| Phase | Livrable |
|---|---|
| 7 | Inventaires (frameworks, monorepo Aphrody) |
| 8 | Outils installés sur le PC et les VPS, vérifiés |
| 9 | Banc d'essai : base de résultats commune, reprise, multi-hôtes, Cloudflare |
| 10 | Boucle navigateur ↔ UI : génération depuis un sitemap, comparaison au pixel près, itération |

## À trancher

| Id | Question |
|---|---|
| D15 | Base de vérité : SQLite comme source, Redis comme cache et file, JSON et MDX comme exports ? |
| D16 | Frameworks cibles de la génération full-stack (Angular, Next.js, Flutter web, Leptos, Dioxus, ...) |
| D17 | Où tourne le banc : PC seul, VPS, ou les deux avec répartition |
