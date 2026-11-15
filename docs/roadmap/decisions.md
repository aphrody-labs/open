# Décisions

## Prises par le propriétaire

| Id | Question | Décision |
|---|---|---|
| D2 | Forme du routeur | **Bibliothèque embarquée et service** : un cœur, une ABI C, un service par-dessus |
| D3 | UI web | **Angular** sur un fork qui suit l'amont automatiquement, avec patchs Bun agressifs, compilation AOT et LTO, et ABI C partagée avec les autres frameworks (Rust, TypeScript, Zig, .NET, C++, ...) |
| D4 | Desktop, mobile, web | **Couverture maximale** : Flutter (desktop, mobile, web), Rust au même niveau, Jetpack Compose Multiplatform en plus |
| D8 | Inférence | **Local first** ; tous les types d'inférence et tous les fournisseurs cloud |
| D12 | Système de build | **Bazel partout** dans Aphrody (pensé comme un futur projet Google) ; just, Turborepo, Bun, Cargo et LLVM sont appelés par les cibles Bazel |
| D13 | Niveaux des portes | **Calqués sur les commandes de Bun** : `check`, `fmt`, `lint`, `build`, `compile`, `test`, `webview`, `pm` ; on réutilise `ay` et les crates Rust de Bun présentes dans Aphrody |
| D14 | Source des specs Material | **Extraction multi-sources** : kit Figma Material 3 ; dépôts GitHub de Google, Chrome et Chromium (UI views), Jetpack Compose, composants Angular, Flutter ; les sites complets de A à Z ; les skills et MCP design de Google ; les versions communautaires (MUI, ...) |
| D18 | Inventaire de l'écosystème | **Très large** : Material pour GTK 4, Qt, COSMIC, Hyprland, egui, iced, Dioxus, gpui ; taffy ; shadcn, Tailwind, Base UI ; React, Svelte, JS, TS ; .NET ; etc. |

## Restant à trancher

| Id | Question | Options | Recommandation |
|---|---|---|---|
| D1 | Que reste-t-il dans `open` ? | tout (93 sources + écosystème) ; seulement ce que les produits utilisent | garder le lock complet, ne construire que ce que les produits utilisent |
| D5 | Terminal | opentui + palette M3 ; autre | opentui |
| D6 | Archive de référence | outils de [browser-and-crawl](../ideas/browser-and-crawl.md) ; stockage | Crawlee + Chrome for Testing + browsertrix (WACZ) ; stockage à définir |
| D7 | Frameworks UI natifs Rust | catalogue ; base commune ; choix d'un seul | avec D4 (Rust au même niveau que Flutter), choisir celui qui porte M3 le mieux après comparaison |
| D9 | Périmètre « tous les types d'inférence » | texte, vision, audio (STT/TTS), image, vidéo, embeddings, rerank, temps réel | à préciser : ordre de priorité |
| D10 | Fournisseurs cloud | tous les fournisseurs découverts (models.dev, OpenRouter, Hugging Face, passerelles Cloudflare et Vercel) | catalogue découvert à l'exécution, aucune liste en dur |
| D11 | Moteurs locaux | llama.cpp, Ollama, ONNX Runtime, OpenVINO, MLX, WebGPU (navigateur) | à préciser selon les cibles matérielles |
