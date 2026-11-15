# Spec du design system

## Sources

| Couche | Source officielle |
|---|---|
| Règles | m3.material.io, design.google (archive de référence) |
| Couleur | material-color-utilities (schéma dynamique depuis la couleur source Aphrody) |
| Tokens | jeu officiel le plus récent de Google ; `--mat-sys-*` d'Angular Material pour le web |
| Composants web | Angular Material (angular/components), sur fork |
| Composants Flutter | Flutter material (desktop, mobile, web) |
| Composants Compose | Jetpack Compose material3, en Compose Multiplatform |
| Icônes | Material Symbols (google/material-design-icons) |
| Polices | Google Sans Flex, Google Sans Code (googlefonts) |
| Maquettes | bibliothèque Figma « Material 3 Design Kit » |

## Couverture (décision D4 : maximale)

| Cible | Implémentations |
|---|---|
| Web | Angular Material (fork), Flutter web, Compose Multiplatform (wasm) |
| Android | Flutter, Compose material3 |
| iOS | Flutter, Compose Multiplatform |
| Desktop (Windows, macOS, Linux) | Flutter desktop, Compose Multiplatform desktop, framework Rust (D7) |
| Terminal | à trancher (D5) |

## Fork Angular (décision D3)

- Forks `angular/angular`, `angular/components` et `angular/angular-cli` dans `aphrody-labs`, qui suivent l'amont automatiquement : la pile de patchs Aphrody est rejouée sur chaque nouvelle tête amont, construite, testée, puis publiée ; un conflit ouvre un ticket au lieu de casser la branche.
- Patchs Bun agressifs : Bun remplace les outils Node (gestionnaire de paquets, exécution des scripts, tests et bundling quand c'est possible).
- Compilation AOT et LTO de la chaîne.

## ABI C partagée

Un cœur commun exposé par une ABI C, consommé par Angular (Bun FFI ou WebAssembly), Flutter (`dart:ffi`), Compose (JNI ou Kotlin/Native cinterop), Rust, Zig, .NET (`LibraryImport`) et C++. Le routeur IA est le premier module de ce cœur.

## Identité Aphrody

Couleur source, variante de schéma et police appliquées par le theming officiel de chaque implémentation (Angular `mat.theme`, Flutter `ColorScheme.fromSeed`, Compose `ColorScheme`). Aucune autre valeur : tout le reste vient des tokens officiels.
