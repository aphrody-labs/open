# Spec du design system (brouillon)

## Sources

| Couche | Source officielle |
|---|---|
| Règles | m3.material.io, design.google (archive de référence) |
| Couleur | material-color-utilities (schéma dynamique depuis la couleur source Aphrody) |
| Tokens | jeu officiel le plus récent de Google ; `--mat-sys-*` d'Angular Material pour le web |
| Composants web | Angular Material (angular/components) |
| Composants Android | Compose material3 (androidx) |
| Multiplateforme | Flutter material |
| Icônes | Material Symbols (google/material-design-icons) |
| Polices | Google Sans Flex, Google Sans Code (googlefonts) |
| Maquettes | bibliothèque Figma « Material 3 Design Kit » |

## Identité Aphrody

- Couleur source et variante de schéma : appliquées par le theming officiel de chaque implémentation (Angular `mat.theme`, Compose `ColorScheme`, Flutter `ColorScheme.fromSeed`).
- Police : Google Sans Flex ; code en Google Sans Code.
- Aucune autre valeur : tout le reste vient des tokens officiels.

## Surfaces

| Surface | Implémentation proposée |
|---|---|
| Web | Angular Material |
| Android | Compose material3 |
| iOS | Flutter (pas d'implémentation iOS officielle active) |
| Desktop | à trancher (Flutter desktop, Compose Multiplatform, ou framework Rust) |
| Terminal | à trancher (opentui avec la palette M3) |

## À trancher

Voir [decisions.md](decisions.md) : D3, D4, D5.
