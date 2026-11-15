# Outillage et portes de validation

## Outillage du monorepo (décision du propriétaire)

| Rôle | Outil |
|---|---|
| Commandes | just |
| Orchestration et cache des tâches JS/TS | Turborepo |
| JS/TS : paquets, scripts, tests, bundling, AOT | Bun |
| Rust | Cargo, profil release LTO fat |
| Compilation native, LTO croisé C/C++/Rust | LLVM (clang, lld) |
| Projets amont qui l'exigent (Angular, Chromium) | Bazel, tel que l'amont le livre |

Les autres outils recommandés par Google entrent par les portes ci-dessous.

## Portes de validation

Rien ne compile sans passer les portes. Elles tournent comme un plugin de build :
- côté Bun : plugin `Bun.plugin` / `bun build` (`onLoad`, `onResolve`) qui valide chaque fichier chargé ;
- côté Cargo : `build.rs` partagé ou sous-commande `cargo` lancée avant `cargo build`.

| Porte | Ce qu'elle vérifie | Source de vérité |
|---|---|---|
| Pratiques web modernes | API et motifs conformes, fonctionnalités Baseline | GoogleChrome/modern-web-guidance, web-platform-dx/web-features |
| HTML | conformité W3C | validator/validator (Nu Html Checker) |
| CSS | conformité W3C | w3c/css-validator |
| Accessibilité | WCAG | dequelabs/axe-core, w3c/wcag |
| Material Design | composants, tokens, états, mise en page, accessibilité M3 | m3.material.io, design.google (archive de référence), specs extraites en JSON |
| Design system | aucune valeur en dur : couleurs, polices, rayons, espacements viennent des tokens officiels | tokens générés |
| Performances | Core Web Vitals (LCP, INP, CLS) | GoogleChrome/lighthouse, GoogleChrome/web-vitals |
| Documentation et roadmap | docs intemporelles, exigences reliées à leur spec, liens valides | Google developer documentation style guide, guide de revue Google eng-practices |
| Hygiène | versions et dates figées, chemins absolus, listes en dur, slop | scanner d'hygiène |

Limite à noter : les Core Web Vitals se mesurent sur un rendu exécuté. Cette porte tourne donc juste après la compilation et bloque la publication, pas la compilation elle-même. Les autres portes sont statiques et bloquent avant compilation.

## À trancher

| Id | Question | Options |
|---|---|---|
| D12 | Bazel | uniquement là où l'amont l'impose (Angular) ; ou comme orchestrateur global à côté de Turborepo |
| D13 | Seuils des portes | bloquant dès la première violation ; ou bloquant par niveau (erreur / avertissement) |
| D14 | Specs Material en JSON | extraites de l'archive de référence (phase 6) ; ou écrites à la main en attendant |
