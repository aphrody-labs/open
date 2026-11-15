# Cahier des charges (brouillon)

## Périmètre

| Inclus | Exclu (proposé) |
|---|---|
| Monorepo `open` : sources absorbées, lock, workspaces Bun et Cargo | Le reste d'Aphrody (src, flotte VPS) |
| Routeur IA : bibliothèque, ABI C, service, surfaces | Entraînement de modèles |
| UI Material 3 officielle pour les surfaces du routeur | Design maison |
| Archive de référence design.google + m3.material.io | Republication publique de contenu Google |

## Exigences

### Monorepo
- R1. Chaque source a son entrée dans `open.lock.json` (url, rev, licence, chemins).
- R2. `bun install` à la racine produit un `bun.lock` ; `bun test` passe par paquet.
- R3. Les crates Rust se construisent en release, LTO fat ; les CLI Bun se compilent en AOT.
- R4. Le dépôt se clone sous Windows, Linux et macOS (aucun chemin invalide).

### Routeur
- R5. API compatible OpenAI (`/v1/chat/completions`, `/v1/models`) et Anthropic (`/v1/messages`).
- R6. Catalogue découvert à l'exécution ; aucune liste de modèles en dur.
- R7. Politique par défaut : gratuit d'abord, bascule automatique avec trace des essais.
- R8. ABI C stable, HTTPS par la pile TLS du système ou un transport fourni par la plateforme.
- R9. Surfaces : CLI, TUI plein écran, desktop, mobile, serverless, auto-hébergé.
- R9a. Livré à la fois comme bibliothèque embarquée et comme service (D2).
- R9b. Local first : l'inférence locale est tentée en premier ; tous les types d'inférence et tous les fournisseurs cloud sont pris en charge (D8).
- R9c. L'ABI C est consommée par Angular, Flutter, Compose, Rust, Zig, .NET et C++, sans réécrire le cœur.

### UI
- R10. Composants et tokens officiels Google uniquement ; identité Aphrody par le theming officiel.
- R10a. Couverture maximale : Angular (fork), Flutter (desktop, mobile, web), Compose Multiplatform, un framework Rust au même niveau (D3, D4).
- R10b. Fork Angular suivant l'amont automatiquement, patchs Bun, compilation AOT et LTO.
- R11. Clair, sombre, contrastes moyen et élevé ; accessibilité M3 (cibles 48 dp, contrastes, focus).

### Archive de référence
- R12. Toutes les pages des deux sites, rendues dans un navigateur réel : capture, DOM, réseau, archive WACZ.
- R13. Respect de robots.txt ; usage interne.

### Outillage et portes
- R14. Outillage : just, Turborepo, Bun, Cargo, LLVM ; Bazel là où l'amont l'impose.
- R15. Portes de validation exécutées comme plugin Bun et Cargo avant toute compilation : pratiques web modernes, W3C (HTML, CSS), WCAG, Material Design, design system sans valeur en dur, docs et roadmap, hygiène. Détail : [toolchain-and-gates.md](toolchain-and-gates.md).
- R16. Core Web Vitals (Lighthouse, web-vitals) mesurés sur le rendu, bloquants avant publication.

## Définition de « fini » (pour chaque livrable)

Construit sans erreur, lancé, testé (tests automatiques verts), prouvé par une capture ou une sortie réelle, scan de secrets propre, revue Gemini Carbon High archivée.

## Hors décision à ce stade

Voir [decisions.md](decisions.md).
