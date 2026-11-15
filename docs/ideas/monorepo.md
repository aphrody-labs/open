# Le monorepo `open`

## Contenu

- 93 sources aplaties, provenance dans [`open.lock.json`](../../open.lock.json) (champs `name`, `url`, `rev`, `path`, `language`, `license`, `archived`, `fork`, `dropped_files`, `submodules`, `role`).
- Répartition par dossier : `packages/` 55, `extra/` 20, `crates/` 12, `ecosystem/` 6.
- Langages : TypeScript 45, Rust 12, Go 7, JavaScript 5, autres (Astro, C, HTML, MDX, Python, Ruby, SCSS, Swift, Tree-sitter Query, Zig) 1 ou 2 chacun.
- Cœur (`role: core`) : `packages/opencode` (anomalyco/opencode) et `packages/openclaw` (openclaw/openclaw, 64 161 fichiers).
- `ecosystem/` : openai/codex, openai/openai-node, openai/openai-agents-js, openai/openai-openapi, OAI/OpenAPI-Specification, hey-api.

## Construction

- Import : `git clone --depth 1` puis `git archive HEAD | tar -x` (historique amont non conservé, rev dans le lock), fichiers de plus de 50 Mo écartés et listés dans `dropped_files`. Script : [`scripts/sync.ts`](../../scripts/sync.ts).
- Secrets : résumé gitleaks dans [`docs/security/`](../security/).
- Workspace Bun : `package.json` racine, globs imbriqués, catalogues hissés, `bunfig.toml` en linker isolé. Généré par `scripts/workspaces.ts` ([`docs/workspaces.md`](../workspaces.md)).
- Workspace Cargo : `Cargo.toml` racine pour les crates feuilles ; les workspaces amont imbriqués (rune, opentunnel, codex-rs, niri, ...) restent autonomes et sont listés en `exclude`. `.cargo/config.toml` : `lto = "fat"`, `codegen-units = 1`, `opt-level = 3`, `strip = "symbols"`.
- AOT Bun : `scripts/aot.ts` (`just aot`) compile les CLI des workspaces.

## Ce qui manque (constaté)

- Pas de `bun.lock` : `bun install` n'a jamais été exécuté sur la racine.
- Aucun binaire AOT ni build Rust LTO produit.
- Le checkout complet contient des chemins invalides sous Windows (`:` dans `extra/niri/docs/wiki/*` et `packages/models.dev/.../*:0.toml`) : un clone Windows échoue hors sparse-checkout.
- Pas de site ni de documentation d'entrée au-delà du `README.md`.
