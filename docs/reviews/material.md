# Import review: the Material 3 libraries

Six official Material 3 code bases, forked under aphrody-labs, imported into `ecosystem/` by `scripts/sync.ts` and followed by the `upstream` workflow.

| Entry | Fork (lock `url`) | Upstream | Imported paths | Path in open |
|---|---|---|---|---|
| angular-material | aphrody-labs/components | angular/components | `src/material`, `src/cdk` | `ecosystem/angular-material` |
| material-web | aphrody-labs/material-web | material-components/material-web | whole repository | `ecosystem/material-web` |
| material-color-utilities | aphrody-labs/material-color-utilities | material-foundation/material-color-utilities | whole repository | `ecosystem/material-color-utilities` |
| material-symbols | aphrody-labs/material-design-icons | google/material-design-icons | `variablefont` | `ecosystem/material-symbols` |
| flutter-material | aphrody-labs/flutter | flutter/flutter | `packages/flutter/lib/src/material` | `ecosystem/flutter-material` |
| compose-material3 | aphrody-labs/androidx | androidx/androidx | `compose/material3/material3` | `ecosystem/compose-material3` |

| Check (D25) | Finding | Outcome |
|---|---|---|
| Provenance | each entry pins `rev`; `source` records the upstream when the commit was taken from it (a fork without commits of its own is imported from its upstream) | kept |
| Verification | upstream code, imported as published; its own test suites run in its own toolchains (Angular CLI, Flutter, Gradle), not in open's Bun and Cargo workspaces | references for the Material 3 surfaces of open, not built here |
| Purification | upstream content, not first-party: the private-data gate skips lock entries | none needed |
| Purge | only the Material libraries of the large repositories (androidx, flutter, angular/components, the icon repository) through partial and sparse clones; root license files kept | kept |
| Reorganisation | one directory per library under `ecosystem/`, named by what it is (D23) | kept |
| Following upstream | `.github/workflows/upstream.yml` runs `bun scripts/sync.ts --update --forks` daily and commits when the tree moved | kept |

`src` pins nothing: it consumes `open`.
