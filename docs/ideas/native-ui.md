# Frameworks UI natifs à réunir

Demande : fusionner en un monorepo (Rust, Bun, C, Zig) les frameworks UI suivants, avec leurs crates, paquets, exemples et écosystème.

| Dépôt | Description (GitHub) | Langage | Licence |
|---|---|---|---|
| anomalyco/rune | Native UI framework | Rust | MIT |
| longbridge/nsh | Native Shell : UI native iOS, Android, macOS, Windows, Linux et web | Rust | non déclarée |
| microsoft/webui | SSR sans JavaScript côté serveur, Web Components | Rust | MIT |
| vercel-labs/ui | Comportements pour que des agents construisent des interfaces | TypeScript | Apache-2.0 |
| vercel-labs/native | Toolkit d'apps desktop natives | Zig | Apache-2.0 |
| vercel-labs/wterm | Émulateur de terminal pour le web | TypeScript | Apache-2.0 |
| zed-industries/zed : `crates/gpui` | framework UI GPU de Zed | Rust | non déclarée |
| anomalyco/opentui | Bibliothèque de TUI | TypeScript | MIT |
| iced-rs/iced | GUI Rust inspirée d'Elm | Rust | MIT |
| emilk/egui | GUI immédiate, web et natif | Rust | Apache-2.0 |
| shadcn-ui/ui | Composants à copier et adapter | TypeScript | MIT |
| mui/base-ui | Composants sans style, accessibles | TypeScript | MIT |

## Ce qu'un essai a montré

- Les 12 sources s'aplatissent en environ 550 Mo avec un lock de provenance.
- `gpui` seul tire 15 crates internes de Zed par ses dépendances de chemin, plus des dépendances propres à chaque plateforme (`gpui_linux`, `gpui_macos`, ...) déclarées dans `[target.'cfg(...)'.dependencies]` : il faut suivre ces sections et ré-enraciner le workspace de Zed (`[workspace.dependencies]`) pour que `cargo` résolve.
- Plusieurs dépôts sont eux-mêmes des workspaces (rune, nsh, webui) : ils restent autonomes dans le workspace racine.
- Deux dépôts portent le même nom (`aphrody-labs/ui` fork de shadcn-ui, et `vercel-labs/ui`) : préfixer par l'organisation.

## Points ouverts

- But de la fusion : catalogue de référence, base de code commune, ou choix d'un framework cible pour Aphrody.
- Lien avec Material 3 : lequel de ces frameworks reçoit les composants M3 (voir [design-system.md](design-system.md)).
