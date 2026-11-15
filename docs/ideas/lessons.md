# Leçons de la session

Verdict du propriétaire sur le travail livré : 0/10. Tout a été purgé. Causes, et règles qui en découlent.

| Ce qui s'est passé | Règle |
|---|---|
| Interfaces faites à la main (CSS, Win32, moteur de couleur, maquettes Figma génériques) | Composants et tokens officiels Google uniquement ; jamais de réimplémentation |
| Valeurs en dur (lignes de tableau, couleurs, listes de modèles) | Les données viennent d'une source (lock, API, tokens générés) |
| Fan-out d'agents, 90 dépôts clonés, déploiements multiples, sans plan | Une roadmap et un cahier des charges validés avant d'exécuter |
| Livraison par petits morceaux « non vérifié, non compilé » | Livrer complet : construit, lancé, testé, prouvé |
| Vérifications de surface (README) | Lire manifestes, code, Context7, graphe de dépendances avant de choisir |
| Playwright choisi sans justification alors qu'une liste d'outils était donnée | Partir de la liste du propriétaire et de l'inventaire existant |
| Material Web présenté comme l'implémentation web | Vérifier l'état réel d'un projet (maintenance, archivage) avant de l'adopter |
| Excuses de machine (« ce PC n'a pas ... ») | Corriger la configuration de façon reproductible |
