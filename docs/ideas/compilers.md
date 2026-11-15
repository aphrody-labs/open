# Compiler du TypeScript en natif : scriptc et Bun AOT

## vercel-labs/scriptc

- « TypeScript-to-Native Compiler », Apache-2.0, expérimental.
- Compile TypeScript et JavaScript en exécutable natif et en WebAssembly, en s'appuyant sur les types vérifiés par le compilateur TypeScript ; aucun moteur JavaScript embarqué, Node.js n'est pas requis à l'exécution.
- Couvre un sous-ensemble de JavaScript, TypeScript et des API Node.js ; `scriptc coverage` indique ce qui compile ; diagnostics et suggestions de réécriture pour le reste ; valeurs de type inconnu (`unknown`, `any`, `JSON.parse`) stockées avec leur type et vérifiées à la conversion.
- Dépendances npm compilées dans l'exécutable (prise en charge partielle).
- Intégration native : `--emit=obj` produit un objet relogeable à lier dans Xcode, CMake ou un éditeur de liens ; `--lib --profile` produit une bibliothèque appelable par une application hôte ; FFI vers le C déclaré en TypeScript et décrit par un manifeste JSON.
- Installation par npm (Node.js 24+) ou archives autonomes.

## Bun `--compile` et AOT

- Produit un exécutable autonome qui embarque le runtime Bun (JavaScriptCore) et le programme : sémantique JavaScript complète, toutes les API Bun et Node.js prises en charge par Bun.
- `bytecode` : bytecode précompilé (démarrage plus rapide) ; `bytecodeOrder` : disposition du bytecode guidée par un profil d'exécution.
- `aot: true` : compile le programme en code machine avant l'exécution ; `aotExplain` rapporte les gardes posées ; `aotHarden` ajoute des vérifications à l'exécution ; `obfuscate` retire noms et emplacements ; `allowCodeFromDisk` est désactivé par défaut.
- `trim` retire les API Bun et Node.js jamais appelées.
- Compilation croisée vers 9 cibles (macOS, Linux glibc et musl, Windows, x64 et arm64).

## Comparaison

| | scriptc | Bun AOT |
|---|---|---|
| Moteur à l'exécution | aucun (code natif, runtime minimal) | JavaScriptCore embarqué, programme en code machine |
| Couverture du langage | sous-ensemble, rapport de couverture | complète |
| API | sous-ensemble de Node.js | Bun + Node.js |
| Sorties | exécutable, WebAssembly, objet natif, bibliothèque | exécutable |
| Interop C | FFI par manifeste, objet et bibliothèque liables | `bun:ffi` |
| Maturité | expérimental | partie de Bun |

Lecture : scriptc vise des binaires sans moteur et une ABI liable (utile pour l'ABI C partagée) ; Bun AOT garde toute la sémantique et toutes les API. Les deux se mesurent sur le banc d'essai (taille, démarrage, débit, mémoire, couverture), aucun chiffre n'est retenu sans mesure.

## Chaîne TypeScript croisée (demande du propriétaire)

Outils : oxc (analyse, lint, format), `bun check`, TypeScript 7 (compilateur natif), scriptc, Bun AOT. Références : spécification ECMAScript (ECMA-262, TC39) et documentation TypeScript de Microsoft. Objectif : un système qui compare moteurs, runtimes, linters et compilateurs sur les mêmes programmes, avec benchmarks.

Constat : `typescript@latest` est la 7.0.2 ; son API JavaScript a changé (`typescript/unstable/*`), `ts.createProgram` n'existe plus à l'export par défaut.
