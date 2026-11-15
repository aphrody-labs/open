# Décisions à trancher

| Id | Question | Options | Recommandation |
|---|---|---|---|
| D1 | Que reste-t-il dans `open` ? | tout (93 sources + écosystème) ; seulement ce que les produits utilisent | garder le lock complet, ne construire que ce que les produits utilisent |
| D2 | Forme du routeur | bibliothèque embarquée ; service ; les deux | les deux : un cœur, une ABI C, un service mince |
| D3 | UI web | Angular Material ; autre | Angular Material (recommandé par Google) |
| D4 | Desktop | Flutter desktop ; Compose Multiplatform ; framework Rust (gpui, iced, egui, rune, nsh) | Flutter ou Compose pour rester sur une implémentation M3 officielle |
| D5 | Terminal | opentui + palette M3 ; autre | opentui |
| D6 | Archive de référence | outils de [browser-and-crawl](../ideas/browser-and-crawl.md) ; stockage | Crawlee + Chrome for Testing + browsertrix (WACZ) ; stockage à définir |
| D7 | Frameworks UI natifs | catalogue ; base commune ; choix d'un seul | catalogue d'abord, choix après comparaison |
| D8 | « Illimité » | modèles locaux en dernier recours ; abonnements | modèles locaux (llama.cpp / Ollama) en dernier recours |
