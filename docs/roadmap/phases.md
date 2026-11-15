# Phases proposées

Chaque phase se termine selon la définition de « fini » de [spec.md](spec.md).

| Phase | Livrable | Dépend de |
|---|---|---|
| 0 | Décisions D1 à D8 prises ; spec et design system validés | — |
| 1 | Monorepo sain : clone multiplateforme, `bun.lock`, builds Bun AOT et Rust LTO verts | D1 |
| 2 | Archive de référence design.google + m3.material.io (pipeline de [browser-and-crawl](../ideas/browser-and-crawl.md)) | D6 |
| 3 | Thème Aphrody sur les implémentations M3 officielles retenues | D3, D4 |
| 4 | Routeur : bibliothèque + ABI C + service, politique gratuit d'abord | D2 |
| 5 | Surfaces du routeur (CLI, TUI, web, desktop, mobile, serverless) en M3 officiel | phases 3 et 4, D5 |
| 6 | Frameworks UI natifs réunis, si D7 le retient | D7 |
