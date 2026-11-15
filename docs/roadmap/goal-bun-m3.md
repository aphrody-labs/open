# Livrable de validation du goal : application fullstack Bun × Material 3

Critère donné par le propriétaire : le goal n'est validé qu'une fois ce livrable produit.

## Définition

Une application fullstack Bun 1.4.5, compilée en un exécutable (`bun build --compile`, AOT), qui :

1. lit récursivement **tous** les MDX de la documentation du fork `aphrody-labs/bun` ;
2. convertit chacun en **skill** au format Agent Skills (utilisable par Vercel skills, Claude, Codex, ...) ;
3. pour chaque skill, produit **un usage réel de la feature décrite** (code serveur qui l'appelle) et **un composant Material 3 correspondant** qui l'affiche ;
4. embarque un **design system généré comme Material Theme Builder** pour chaque framework (web, Flutter, Compose, Android), dont la couleur source vient des assets et du press kit de Bun ;
5. **prouve** par un rapport de couverture qu'elle utilise toutes les API de Bun (surface lue dans `bun-types`) et tous les composants du kit Figma Material 3.

## Sources mesurées

| Source | Mesure |
|---|---|
| Docs du fork Bun (`docs/**/*.mdx`) | 1 406 fichiers : lint 1 051, guides 195, runtime 67, pm 28, snippets 16, test 13, bundler 11, compiler 11, project 6, autres 8 |
| Surface d'API | 33 fichiers `packages/bun-types/*.d.ts` |
| Press kit | bun.com/press-kit : `presskit.zip`, `logo.svg`, `wordmark.svg`, `icon.svg`, icônes PNG ; couleurs de la page `#fbf0df`, `#f472b6`, `#14151a` |
| Kit Material 3 | bibliothèque Figma « Material 3 Design Kit » (communauté) |

## Étapes, chacune vérifiable

| # | Étape | Preuve attendue |
|---|---|---|
| 1 | Sources : checkout partiel du fork (docs, bun-types), press kit téléchargé | compte de fichiers, révision |
| 2 | MDX → skills (`SKILL.md` avec `name` et `description`), un par doc | 1 406 skills, validation du format |
| 3 | Surface d'API de Bun extraite de `bun-types` | liste d'API avec fichier source |
| 4 | Thème Theme Builder depuis le press kit : exports web (CSS), Flutter (Dart), Compose (Kotlin), Android (XML) | fichiers générés, couleur source tracée |
| 5 | Inventaire du kit Figma M3 | liste des composants et variantes |
| 6 | Application : une page par skill, usage réel côté serveur et composant M3 côté client | rendu dans Chrome for Testing |
| 7 | Compilation `bun build --compile` (AOT) | exécutable lancé |
| 8 | Rapport de couverture : API Bun et composants M3 | 100 % ou liste exacte des manques |

## Décision nécessaire

| Id | Question | Options |
|---|---|---|
| D19 | Composants M3 dans l'application Bun | Angular Material (cohérent avec D3, impose la compilation Angular dans la chaîne) ; Material Web (composants web natifs, bundlables tels quels par Bun, mais en maintenance) |

Note sur « LTO » : la compilation Bun AOT produit du bytecode JavaScript embarqué dans le runtime Bun ; le LTO concerne la partie native, c'est-à-dire le build du runtime Bun lui-même (fork) et toute bibliothèque native liée par l'application.
