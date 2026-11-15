# Vision long terme (proposition)

`open` réunit l'écosystème open source dont Aphrody a besoin, dans un seul dépôt construit de bout en bout, et en tire trois produits :

1. **Un routeur IA libre** : multi-fournisseurs, gratuit d'abord (offres gratuites, puis modèles locaux, puis payant au moins cher), compatible OpenAI et Anthropic, exposé par une ABI C pour être embarqué partout, et auto-hébergeable.
2. **Des interfaces Material 3 authentiques** : les implémentations officielles de Google (Angular Material, Compose, Flutter), thémées avec l'identité Aphrody, sur web, desktop, mobile et terminal.
3. **Une source de vérité vivante** : sites et dépôts de référence (design.google, m3.material.io, implémentations M3, écosystème « open ») archivés, indexés et reliés au code.

Principes :

- Absorber plutôt que réécrire ; une provenance (lock) pour tout ce qui entre.
- Aucune valeur en dur : données lues d'une source, versions résolues à l'exécution.
- Livrer complet : chaque étape se termine construite, lancée, testée et prouvée.
- Bun pour le JS/TS (AOT), Rust en LTO fat, C pour l'ABI, Zig là où l'amont l'utilise.
