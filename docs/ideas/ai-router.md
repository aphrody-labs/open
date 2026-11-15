# Routeur IA libre, gratuit, multi-fournisseurs

Idée : un seul routeur, compatible OpenAI et Anthropic, qui découvre les modèles à l'exécution et bascule d'une offre à l'autre jusqu'à obtenir une réponse ; utilisable depuis n'importe quel langage par une ABI C, et depuis toutes les surfaces (CLI, TUI, desktop, mobile, serverless, auto-hébergé).

## Ce qui existe déjà comme base

Le routeur `ai-os` d'Aphrody (TypeScript, Bun) a la logique : catalogue joint depuis models.dev, la table de prix litellm, OpenRouter `/models`, le routeur Hugging Face et le classement Arena ; politiques `auto`, `auto:cheap`, `auto:fast`, `auto:code`, `auto:long`, `arena` ; bascule sur 429, 5xx, délai, quota, 4xx propre au modèle ; HTTP `/v1/chat/completions`, `/v1/messages`, `/v1/models`.

## Prototypes faits puis retirés

Tout a été construit, testé, puis purgé sur décision du propriétaire. Les faits restent utiles :

| Prototype | Résultat mesuré |
|---|---|
| ABI C (5 appels : `open`, `request`, `chat`, `models`, `close`), sockets BSD et Winsock | OK sur Linux contre un serveur OpenAI factice : réponse simple et réponse chunked, bearer, échappement JSON |
| HTTPS par la pile TLS du système : WinHTTP sous Windows, libcurl chargée par `dlopen` ailleurs | OK en direct sous Windows et Linux, sans dépendance de lien |
| Hook de transport `ay_router_set_transport` : la plateforme fournit HTTPS (Java `HttpURLConnection` sur Android, URLSession sur iOS) | écrit, jamais compilé |
| Politique `auto:free` : offres à prix nul d'abord (meilleur score Arena), puis payantes les moins chères | 21 tests verts |
| Worker Cloudflare compatible OpenAI, offres découvertes à l'exécution (Workers AI, Gemini free tier) | `glm-5.3-flash` refusé (« not available on the Workers Free plan »), bascule automatique sur `glm-4.7-flash` qui répond ; trace des essais renvoyée dans la réponse |
| Binding Rust (`build.rs` compile le C) | test en direct vert |
| CLI, chat terminal en ligne, chat desktop Win32 | réponses réelles obtenues |

Échecs : clés Gemini du coffre refusées par Google (403 « invalid API key ») ; interfaces jugées laides (CSS et Win32 faits à la main au lieu des composants officiels) ; aucune surface mobile ni TUI plein écran.

## Marché

Les passerelles open source sont des proxys, pas des bibliothèques : LiteLLM (Python, MIT, existe aussi en build Rust), Bifrost (Go, Apache-2.0), Portkey (TypeScript, Workers), LLM Gateway (AGPLv3), Agent Router (ex Envoy AI Gateway). Aucune ne publie d'ABI C : c'est le créneau.

## Points ouverts pour la spec

- « Gratuit et illimité » : aucune offre gratuite n'est illimitée (Workers AI : allocation quotidienne ; plans gratuits des fournisseurs limités). Illimité suppose des modèles locaux (llama.cpp, Ollama) en dernier recours.
- Où vit le routeur : bibliothèque embarquée, service auto-hébergé, ou les deux.
- Quelle UI : composants officiels Google (voir [design-system.md](design-system.md)).
