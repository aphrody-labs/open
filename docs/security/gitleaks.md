# Gitleaks summary

Scanner: gitleaks 8.30.1, `gitleaks dir` on the full tree before the first commit (881 MB scanned).
Total findings: 539. Findings in files authored here (root files, scripts/, docs/): 0.
All findings are inside verbatim upstream public code (tests, fixtures, examples, docs). Values are never recorded here; counts only.

## By rule

| rule | count |
|---|---|
| generic-api-key | 490 |
| private-key | 25 |
| jwt | 8 |
| aws-access-token | 7 |
| stripe-access-token | 5 |
| gcp-api-key | 2 |
| curl-auth-user | 1 |
| slack-bot-token | 1 |

## By repository

| path | findings | rules |
|---|---|---|
| packages/opencode | 324 | generic-api-key:322, gcp-api-key:1, curl-auth-user:1 |
| packages/guide | 31 | generic-api-key:22, aws-access-token:4, jwt:5 |
| extra/harbor | 25 | generic-api-key:25 |
| ecosystem/openai-codex | 20 | private-key:3, generic-api-key:13, aws-access-token:3, jwt:1 |
| ecosystem/hey-api-hey-api | 19 | generic-api-key:10, jwt:1, private-key:8 |
| packages/v2 | 19 | generic-api-key:19 |
| crates/deadbolt | 16 | generic-api-key:8, private-key:7, stripe-access-token:1 |
| packages/browse | 11 | generic-api-key:6, jwt:1, stripe-access-token:4 |
| extra/pulumi-railway | 9 | generic-api-key:7, private-key:2 |
| packages/sst | 9 | private-key:1, generic-api-key:8 |
| ecosystem/openai-openai-node | 8 | generic-api-key:8 |
| packages/ion | 7 | private-key:1, generic-api-key:6 |
| packages/slack-support | 5 | slack-bot-token:1, generic-api-key:4 |
| ecosystem/openai-openai-agents-js | 4 | generic-api-key:4 |
| packages/effect-http-recorder | 4 | generic-api-key:3, gcp-api-key:1 |
| packages/nightmail | 4 | private-key:1, generic-api-key:3 |
| packages/textjs | 4 | generic-api-key:4 |
| crates/hex | 3 | generic-api-key:3 |
| crates/isocast | 3 | generic-api-key:3 |
| packages/grim | 3 | generic-api-key:3 |
| crates/opentunnel | 2 | generic-api-key:1, private-key:1 |
| packages/agents-benchmark | 2 | generic-api-key:2 |
| crates/rune | 1 | private-key:1 |
| crates/strobe | 1 | generic-api-key:1 |
| ecosystem/oai-OpenAPI-Specification | 1 | generic-api-key:1 |
| extra/computer-use | 1 | generic-api-key:1 |
| extra/opencode-sdk-go | 1 | generic-api-key:1 |
| packages/demo-notes-app | 1 | generic-api-key:1 |
| packages/models.dev | 1 | generic-api-key:1 |
