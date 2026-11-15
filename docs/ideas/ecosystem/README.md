# The "open" ecosystem

Classification of 186 projects carrying the "open" name or spirit (OpenRouter, OpenStreetMap, OpenSSH, OpenSSL, OpenTUI, OpenGL, Vulkan, OpenAI, OpenAPI, ...), built with Context7 and the GitHub API. A critic pass added GLFW, OpenResty, OpenH264, OpenJPEG, Open vSwitch, OpenXLA and Mesa.

- Data: [`ecosystem.json`](ecosystem.json) (`items`, `absorb_plan`, `pin_plan`); table view: [`ecosystem.md`](ecosystem.md).
- Domains: ai 53, geo-data 29, security-net 29, graphics 27, dev-tools 24, platform-os 16, engine 4, media 3, licensing 1.
- Modes: absorb 51 (flattened into `ecosystem/<owner>-<name>`), pin 72 (revision only in the lock), reference 35 (spec or docs), skip 28 (archived, dead or out of scope).
- Size rule: above 300 MB, pin instead of absorb (e.g. Open Interpreter 318 MB, OpenClaw reported at 14.9 GB by GitHub).

Known limits: the monthly Context7 quota ran out during the run, so some Context7 ids are missing; Mesa (GitLab) not verified.
