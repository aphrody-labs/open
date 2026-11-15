# Design system : Material 3, sources officielles Google

Direction donnée par le propriétaire : ne rien réimplémenter, forker et absorber ce que Google publie. « Google livre déjà M3 sur Flutter, Jetpack Compose et Angular. »

## Implémentations officielles et état

| Plateforme | Dépôt | État |
|---|---|---|
| Web | angular/components (Angular Material) | actif ; Google le recommande pour le web |
| Web | material-components/material-web | en maintenance « pending new maintainers » (README) ; le propriétaire le considère legacy |
| Android | androidx/androidx (Compose material3) | actif |
| Android (Views) | material-components/material-components-android | actif |
| Multiplateforme | flutter/flutter (material) | actif |
| iOS | material-components/material-components-ios | archivé |
| Couleur | material-foundation/material-color-utilities | actif |
| Icônes | google/material-design-icons (Material Symbols) | actif |
| Polices | google/fonts, googlefonts/googlesans, googlesans-flex, googlesans-code | actifs |
| Tokens | material-foundation/material-tokens, material-theme-builder | archivés |

Sources de référence pour les règles : m3.material.io et design.google (crawl en cours de conception, voir [browser-and-crawl.md](browser-and-crawl.md)) ; bibliothèque Figma « Material 3 Design Kit » (communauté) déjà connectée au compte.

## Tokens

- Le jeu de tokens officiel le plus récent publié par Google (« Google Material 3 », version 34.x, `tokens/versions/latest/sass` dans le paquet `@material/web`) passe à des variables Sass simples. Il apporte deux valeurs nouvelles par rapport à l'ancien `v0_192` : opacité de focus 0.10 (au lieu de 0.12) et une opacité d'état « disabled » 0.38.
- Angular Material expose ses propres tokens `--mat-sys-*` : c'est la source à suivre si le web passe sur Angular Material.

## Couleur (HCT)

Un portage C freestanding de material-color-utilities (CAM16, HctSolver, schémas dynamiques 2021) a reproduit la référence MCU 0.4.0 à 1e-12 et un schéma complet au bit près, en natif et en wasm sans import. Retiré depuis ; l'enseignement : la science des couleurs se porte exactement, mais la source doit rester MCU.

## Rust

Google ne publie pas M3 pour Rust. Options vérifiées : FerroUI (port d'Avalonia, thème Material 3 Expressive avec composants natifs), egui-material3 (M3 standard), un fork Slint (plan seulement).

## Points ouverts pour la spec

- Web : Angular Material implique le framework Angular ; quelles surfaces passent dessus.
- Desktop natif : Compose Multiplatform, Flutter desktop, ou un framework Rust (voir [native-ui.md](native-ui.md)).
- Identité Aphrody (couleur source, police) appliquée par les mécanismes officiels de theming de chaque implémentation.
