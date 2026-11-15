# Décisions

## Prises par le propriétaire

| Id | Question | Décision |
|---|---|---|
| D2 | Forme du routeur | **Bibliothèque embarquée et service** : un cœur, une ABI C, un service par-dessus |
| D3 | UI web | **Angular** sur un fork qui suit l'amont automatiquement, avec patchs Bun agressifs, compilation AOT et LTO, et ABI C partagée avec les autres frameworks (Rust, TypeScript, Zig, .NET, C++, ...) |
| D4 | Desktop, mobile, web | **Couverture maximale** : Flutter (desktop, mobile, web), Rust au même niveau, Jetpack Compose Multiplatform en plus |
| D8 | Inférence | **Local first** ; tous les types d'inférence et tous les fournisseurs cloud |

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
