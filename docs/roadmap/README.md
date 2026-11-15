# Roadmap d'`open`

Brouillon de discussion : rien n'est engagé tant que les décisions marquées « à trancher » ne sont pas prises avec le propriétaire.

| Fichier | Contenu |
|---|---|
| [vision.md](vision.md) | Vision long terme |
| [spec.md](spec.md) | Cahier des charges : périmètre, exigences, définition de « fini » |
| [design-system.md](design-system.md) | Spec du design system (Material 3 officiel) |
| [phases.md](phases.md) | Ordre de livraison |
| [toolchain-and-gates.md](toolchain-and-gates.md) | Outillage du monorepo et portes de validation avant compilation |
| [benchmark-platform.md](benchmark-platform.md) | `open` comme banc d’essai automatisé, inventaires, boucle navigateur ↔ UI |
| [decisions.md](decisions.md) | Décisions à trancher, avec options et recommandation |

Matière première : [`../ideas/`](../ideas/).

Handoff GUI : la migration Electron vers Tauri v3 / GPUI vit dans `src/electron-migrate` (`ay electron`, skill `electron-migrate`, outils MCP `electron__*`) ; non étendue côté src, la suite appartient à `open`.
