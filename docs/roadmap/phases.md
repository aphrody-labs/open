# Phases

Chaque phase se termine selon la définition de « fini » de [spec.md](spec.md).

| Phase | Livrable | Dépend de | État |
|---|---|---|---|
| 0 | Décisions prises ; spec et design system validés | — | D2, D3, D4, D8 prises ; D1, D5, D6, D7, D9 à D11 ouvertes |
| 1 | Monorepo sain : clone multiplateforme, `bun.lock`, builds Bun AOT et Rust LTO verts | D1 | clone Windows réglé (310 fichiers écartés) ; reste `bun.lock` et builds |
| 1b | Outillage just + Turborepo + Bun + Cargo + LLVM ; portes de validation en plugin Bun et Cargo | D12 à D14 | à démarrer |
| 2 | Forks Angular (angular, components, angular-cli) qui suivent l'amont, patchs Bun, AOT et LTO | D3 | forks créés dans aphrody-labs ; suivi automatique et patchs à faire |
| 3 | Cœur ABI C commun et routeur IA (bibliothèque + service, local first) | D2, D8 à D11 | à démarrer |
| 4 | Thème Aphrody sur Angular Material, Flutter material, Compose material3, framework Rust | D4, D7 | à démarrer |
| 5 | Surfaces du routeur sur toutes les cibles (web, Android, iOS, desktop, terminal, serverless, auto-hébergé) | phases 2 à 4, D5 | à démarrer |
| 6 | Archive de référence design.google + m3.material.io | D6 | à démarrer |
