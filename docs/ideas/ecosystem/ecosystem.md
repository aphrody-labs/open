# Open ecosystem

186 projects classified (Context7 via relay hub, gh api). Modes: absorb = flattened into ecosystem/<owner>-<name>; pin = rev recorded in open.lock.json only; reference = spec/docs; skip = out of scope. Context7 ids missing where the monthly quota ran out. Machine-readable: ecosystem.json.

## ai

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| Open Interpreter (renamed openinterpreter/openinterpreter) | agent-cli | openinterpreter/openinterpreter | /openinterpreter/openinterpreter | Rust | Apache-2.0 | rust-v0.0.61 | pin | Mode fixed: 318 MB exceeds 300 MB absorb cap |
| OpenAI codex | agent-cli | openai/codex | /openai/codex | Rust | Apache-2.0 | rust-v0.169.0 | pin | Rust agent CLI; already absorbed, track rev |
| opencode (anomalyco, ex sst/opencode) | agent-cli | anomalyco/opencode | /anomalyco/opencode | TypeScript | MIT | v1.19.5 | pin | Bun/TS agent CLI; already absorbed |
| opencode-ai/opencode (Go) | agent-cli | opencode-ai/opencode | /opencode-ai/opencode | Go | MIT | v0.0.55 | skip | Archived |
| Open Deep Research | agent | langchain-ai/open_deep_research | /langchain-ai/open_deep_research | Python | MIT | none | skip | Archived |
| OpenAI openai-agents-js | agent | openai/openai-agents-js | /openai/openai-agents-js | TypeScript | MIT | @openai/agents-extensions@0.22.0 | pin | TS agents SDK |
| OpenAI openai-agents-python | agent | openai/openai-agents-python | none | Python | MIT | v0.24.0 | absorb | Python agents SDK, reference for ai-os orchestration |
| OpenClaw | agent | openclaw/openclaw | /openclaw/openclaw | TypeScript | MIT | v2026.11.3 | pin | Personal agent gateway; gh reports about 14.9 GB, far too big to flatten; pin rev only |
| OpenHands | agent | OpenHands/OpenHands | /openhands/openhands | TypeScript | MIT | v1.40.0 | pin | Autonomous coding agent platform; large; also /openhands/docs |
| OpenRouter go-agent | agent | OpenRouterTeam/go-agent | none | Go | Apache-2.0 | v0.8.0 | absorb | Small agent lib, reference |
| OpenRouter python-agent | agent | OpenRouterTeam/python-agent | none | Python | NOASSERTION | none | absorb | Small agent lib, reference |
| OpenRouter typescript-agent | agent | OpenRouterTeam/typescript-agent | /websites/openrouter_ai_agent-sdk | TypeScript | none | @openrouter/agent@1.2.1 | absorb | Agent SDK on OpenRouter; no license declared (owner policy: licenses do not decide); context7 id is the docs site |
| OpenRouter sign-in-with-openrouter | auth | OpenRouterTeam/sign-in-with-openrouter | none | TypeScript | MIT | none | absorb | OAuth PKCE for OpenRouter keys |
| OpenRouter benchmark-harness | benchmark | OpenRouterTeam/benchmark-harness | none | TypeScript | Apache-2.0 | agent-runtime-v3 | absorb | Agent runtime benchmark |
| OpenRouter search-benchmarks | benchmark | OpenRouterTeam/search-benchmarks | none | TypeScript | MIT | none | skip | Large data-heavy, stale since August |
| OpenRouter tool-bench | benchmark | OpenRouterTeam/tool-bench | none | Rust | MIT | none | absorb | Rust tool-calling benchmark, fits Rust workspace |
| OpenRouter cc-test-mastra | demo | OpenRouterTeam/cc-test-mastra | none | TypeScript | none | none | skip | Test scratch repo |
| OpenRouter multimedia-explorer | demo | OpenRouterTeam/multimedia-explorer | none | TypeScript | none | none | skip | Demo app |
| OpenAI openai-cookbook | docs | openai/openai-cookbook | none | Jupyter Notebook | MIT | none | skip | 1 GB of notebooks, no code value |
| OpenRouter docs | docs | OpenRouterTeam/docs | /openrouterteam/docs | MDX | none | none | reference | API docs; also /websites/openrouter_ai and /llmstxt/openrouter_ai_llms_txt; use via context7 |
| OpenAI evals | eval | openai/evals | none | Python | NOASSERTION | none | reference | Eval framework, slow-moving |
| OpenCompass | eval | open-compass/opencompass | none | Python | Apache-2.0 | 0.5.5 | reference | LLM eval suite |
| OpenAI openai-realtime-agents | example | openai/openai-realtime-agents | none | TypeScript | MIT | none | absorb | Realtime voice agent reference |
| OpenRouter openrouter-examples | examples | OpenRouterTeam/openrouter-examples | none | TypeScript | MIT | none | absorb | Usage examples (stale since March) |
| OpenRouter openrouter-examples-python | examples | OpenRouterTeam/openrouter-examples-python | none | Python | none | none | skip | Stale (Apr 2025) |
| OpenPipe | fine-tuning | OpenPipe/OpenPipe | none | TypeScript | Apache-2.0 | none | skip | Dead since May 2024 |
| OpenAI harmony | format | openai/harmony | /openai/harmony | Rust | Apache-2.0 | none | absorb | Rust response-format renderer for gpt-oss; tiny, fits crates/ |
| OpenRouter awesome-openrouter | index | OpenRouterTeam/awesome-openrouter | none | JavaScript | none | none | reference | Link list |
| ONNX Runtime | inference | microsoft/onnxruntime | /microsoft/onnxruntime | C++ | MIT | v1.32.0 | pin | DirectML/WebGPU/CPU inference on Windows; huge C++ tree, pin in third_party; also /websites/onnxruntime_ai |
| OpenVINO | inference | openvinotoolkit/openvino | /openvinotoolkit/openvino | C++ | Apache-2.0 | 2026.4.1 | pin | Intel CPU/GPU/NPU inference; huge C++ tree, belongs in third_party; also /websites/openvino_ai_2026, /openvinotoolkit/openvino.genai |
| OpenXLA XLA | inference | openxla/xla | none | C++ | Apache-2.0 | none | pin | ML compiler (StableHLO/LLVM backends); large C++ |
| OpenRouter terraform-provider | infra | OpenRouterTeam/terraform-provider-openrouter | none | Go | MIT | v0.3.266 | skip | Terraform not in stack |
| ONNX | model-format | onnx/onnx | /onnx/onnx | Python | Apache-2.0 | v1.23.2 | absorb | Model format and protobuf schema; moderate size, needed to read models |
| open_clip | model | mlfoundations/open_clip | none | Python | NOASSERTION | v4.2.2 | reference | CLIP training/inference, reference for vision embeddings |
| OpenAI gpt-oss | model | openai/gpt-oss | /openai/gpt-oss | Python | Apache-2.0 | v0.0.9 | absorb | Open-weight model reference impls (torch/triton/metal) |
| Opik | observability | comet-ml/opik | /comet-ml/opik | Python | Apache-2.0 | 2.2.143 | pin | LLM tracing and evals, Java/Python backend plus TS SDK; large |
| OpenAI openai-dotnet | sdk | openai/openai-dotnet | none | C# | MIT | OpenAI_2.15.0 | pin | .NET 11 apps; large (generated), pin only |
| OpenAI openai-go | sdk | openai/openai-go | none | Go | Apache-2.0 | v3/vertex/v1.0.3 | skip | Go not in stack |
| OpenAI openai-java | sdk | openai/openai-java | none | Kotlin | Apache-2.0 | v4.105.0 | skip | JVM not in stack (Android only) |
| OpenAI openai-node | sdk | openai/openai-node | /websites/developers_openai | TypeScript | Apache-2.0 | v7.57.0 | pin | Bun/TS client; context7 has no repo id for it, only the docs site |
| OpenAI openai-python | sdk | openai/openai-python | /openai/openai-python | Python | Apache-2.0 | v3.51.0 | absorb | Python reference client |
| OpenRouter ai-sdk-provider | sdk | OpenRouterTeam/ai-sdk-provider | none | TypeScript | Apache-2.0 | 3.1.0 | absorb | AI SDK provider for ai-os |
| OpenRouter go-sdk | sdk | OpenRouterTeam/go-sdk | none | Go | Apache-2.0 | v0.9.116 | absorb | Go client; spec-generated, low priority |
| OpenRouter python-sdk | sdk | OpenRouterTeam/python-sdk | none | Python | Apache-2.0 | v1.3.178 | absorb | Python client; reference for generated SDK shape |
| OpenRouter TypeScript SDK | sdk | OpenRouterTeam/typescript-sdk | none | TypeScript | Apache-2.0 | not read | absorb | AI routing client |
| OpenLLM | serving | bentoml/OpenLLM | none | Python | Apache-2.0 | v0.6.30 | reference | Python serving on BentoML; context7 resolve returned only traceloop/openllmetry (no match for OpenLLM) |
| OpenRouter skills | skills | OpenRouterTeam/skills | none | TypeScript | none | none | absorb | Agent skills for OpenRouter |
| OpenAI openai-openapi | spec | openai/openai-openapi | none | none | MIT | 2.0.0 | reference | OpenAPI spec; feeds hey-api codegen |
| OpenAI whisper | speech | openai/whisper | none | Python | MIT | v20250625 | reference | Covered by whisper.cpp |
| OpenAI tiktoken | tokenizer | openai/tiktoken | /openai/tiktoken | Python | MIT | 0.14.0 | absorb | BPE tokenizer with Rust core; token counting in ai-os |
| open-r1 | training | huggingface/open-r1 | none | Python | Apache-2.0 | none | absorb | Reasoning-model training recipes; fits LLM factory vision |
| Open WebUI | ui | open-webui/open-webui | /open-webui/open-webui | Svelte | NOASSERTION | v0.13.3 | pin | Self-hosted LLM chat UI; large Svelte+Python, custom license; also /open-webui/docs |
| OpenRouter markdown-wasm | wasm | OpenRouterTeam/markdown-wasm | none | Rust | Apache-2.0 | v0.2.2 | absorb | Tiny Rust-to-Wasm markdown |

## dev-tools

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| hey-api openapi-ts | codegen | hey-api/openapi-ts | none | TypeScript | MIT | unknown | pin | Mode fixed: already flattened |
| openapi-generator | codegen | OpenAPITools/openapi-generator | none | Java | Apache-2.0 | v7.27.0 | pin | huge Java tree, JVM; pin only |
| OCI distribution-spec | containers | opencontainers/distribution-spec | none | Go | Apache-2.0 | v1.1.1 | reference | registry API spec |
| OCI image-spec | containers | opencontainers/image-spec | none | Go | Apache-2.0 | v1.1.1 | reference | image format spec |
| OCI runtime-spec | containers | opencontainers/runtime-spec | none | Go | Apache-2.0 | v1.3.0 | reference | container spec |
| runc | containers | opencontainers/runc | none | Go | Apache-2.0 | v1.5.3 | pin | OCI reference runtime, Linux only; fr hosts |
| OpenFeature JS SDK | feature-flags | open-feature/js-sdk | none | TypeScript | Apache-2.0 | angular-sdk-v1.3.2 | absorb | Bun/TS flags SDK, moderate size |
| OpenFeature spec | feature-flags | open-feature/spec | none | Gherkin | Apache-2.0 | no semver tag (latest: provider-tck v0.1.0) | reference | flag API spec |
| OpenGL-Registry | graphics | KhronosGroup/OpenGL-Registry | none | C | none | no release | reference | GL spec/XML registry |
| Vulkan-Loader | graphics | KhronosGroup/Vulkan-Loader | none | C | NOASSERTION | no release; latest tag windows-rt-1.0.8.1 | pin | Vulkan loader |
| OpenTofu | iac | opentofu/opentofu | none | Go | MPL-2.0 | v1.13.9 | pin | Go IaC tool; pin |
| Redoc | openapi-tooling | Redocly/redoc | none | TypeScript | MIT | redoc@3.1.0 | absorb | API docs renderer |
| Redocly CLI | openapi-tooling | Redocly/redocly-cli | none | TypeScript | MIT | @redocly/respect-core@2.78.0 | absorb | OpenAPI lint/bundle in Bun |
| OpenRewrite | refactoring | openrewrite/rewrite | none | Java | Apache-2.0 | v8.108.0 | skip | JVM refactoring, little fit for Bun+Rust |
| OpenJDK | runtime | openjdk/jdk | none | Java | GPL-2.0 | no release; latest tag jdk-28+24 | skip | 1.5 GB JVM, not needed |
| Arazzo Specification | spec | OAI/Arazzo-Specification | none | JavaScript | Apache-2.0 | 1.1.0 | reference | workflow spec over OpenAPI; spec only |
| OpenAPI Overlay Specification | spec | OAI/Overlay-Specification | none | JavaScript | Apache-2.0 | 1.2.0 | reference | spec for patching OpenAPI docs |
| OpenAPI Specification | spec | OAI/OpenAPI-Specification | none | Markdown | Apache-2.0 | 3.2.1 | reference | Mode fixed: already flattened in open |
| OpenSSH portable | ssh | openssh/openssh-portable | none | C | NOASSERTION | no release; latest tag V_10_6_P2 | pin | C core third_party |
| Ghostty | terminal | ghostty-org/ghostty | none | Zig | MIT | no release; latest tag vt-1.0.1 | pin | not open-branded, not in anomalyco; Zig terminal; pin only |
| WezTerm | terminal | wezterm/wezterm | none | Rust | NOASSERTION | 20240203-110809-5046fc22 | pin | Rust terminal, large; pin |
| xterm.js | terminal | xtermjs/xterm.js | none | TypeScript | MIT | 6.0.0 | absorb | web terminal for aphrody app; moderate size |
| OpenSSL | tls | openssl/openssl | none | C | Apache-2.0 | openssl-4.1.0 | pin | C core TLS |
| OpenTUI | tui | anomalyco/opentui | none | TypeScript | MIT | v0.9.0 | pin | Mode fixed: already flattened (forks.txt:11) |

## engine

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| O3DE | game engine | o3de/o3de | none (quota) |  | NOASSERTION (Apache/MIT) | 2605.0 | pin | reference engine, 233 MB |
| OpenMW | game | OpenMW/openmw | none (quota) |  | GPL-3.0 | openmw-0.51.0 | reference | Morrowind engine reimpl; GPL; study only |
| OpenRCT2 | game | OpenRCT2/OpenRCT2 | none (quota) |  | GPL-3.0 | v0.5.7 | skip | game reimpl, no stack value |
| OpenTTD | game | OpenTTD/OpenTTD | none (quota) |  | NOASSERTION (GPL-2.0) | 15.3 | skip | game reimpl, 738 MB |

## geo-data

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| openaddresses | Address dataset tooling | openaddresses/openaddresses | none | Python | BSD-3-Clause | none | reference | Address source index and data pipeline, a dataset not a library |
| arrow-rs | Arrow/Parquet Rust | apache/arrow-rs | none | Rust | Apache-2.0 | 60.1.0 | absorb | Rust Arrow and Parquet crates for the Rust workspace; geoarrow friendly |
| protomaps basemaps | Basemap styles/tiles | protomaps/basemaps | none | Java | NOASSERTION | none | reference | Basemap schema and styles built from OSM for PMTiles |
| apache/arrow | Columnar format | apache/arrow | none | C++ | Apache-2.0 | apache-arrow-26.0.1 | pin | Columnar data spec and C++ impl, huge multi-language tree; pin and use arrow-rs and the JS package |
| OpenTimelineIO | Editorial timeline interchange | AcademySoftwareFoundation/OpenTimelineIO | none | C++ | Apache-2.0 | none | absorb | C++ core with Python bindings; timeline interchange for the creative suite. The seed owner OpenTimelineIO/ does not exist (404) |
| openfreemap | Free tile hosting | hyperknot/openfreemap | none | Python | NOASSERTION | none | reference | Self-hostable planet tile infra scripts (Python); a pattern for tile hosting |
| Nominatim | Geocoder | osm-search/Nominatim | none | Python | GPL-3.0 | v5.3.3 | reference | Python geocoder server, GPL, needs PostgreSQL; use the API as a service |
| Overture Maps data | Open map dataset docs/schema | OvertureMaps/data | none | HTML | MIT | none | reference | Dataset release notes and schema pointers; data is on S3/Azure |
| CGImap | OSM API server | openstreetmap/CGImap | none | C++ | GPL-2.0 | none | skip | Archived, last push 2022-07-22 |
| libosmium | OSM C++ lib | osmcode/libosmium | none | C++ | BSL-1.0 | v2.23.1 | pin | Header-only C++ OSM reader/writer; a C core third_party candidate |
| osmium-tool | OSM CLI | osmcode/osmium-tool | none | C++ | GPL-3.0 | v1.19.0 | pin | OSM extract/convert CLI built on libosmium |
| osm2pgsql | OSM import | osm2pgsql-dev/osm2pgsql | none | C++ | GPL-2.0 | 2.3.1 | pin | OSM-to-PostGIS importer (C++); a build tool for tile data pipelines |
| osmosis | OSM Java tool | openstreetmap/osmosis | none | Java | none declared | 0.49.2 | skip | Last push 2024-12-29, superseded by osmium-tool |
| Overpass-API | OSM query server | drolbr/Overpass-API | none | C++ | AGPL-3.0 | osm3s_v0.7.62.4 | reference | OSM query backend, AGPL, a server rather than a library; use the public API instead |
| iD editor | osm-editor | openstreetmap/iD | none | JavaScript | ISC | v2.42.3 | pin | Mode fixed: 556 MB exceeds cap |
| overturemaps-py | Overture CLI | OvertureMaps/overturemaps-py | none | Python | MIT | v2.1.1 | skip | Python downloader; the dataset can be read with Arrow/Parquet instead |
| parquet-java | Parquet format | apache/parquet-java | none | Java | Apache-2.0 | apache-parquet-1.18.2 | skip | Java reference impl; Rust Parquet comes from arrow-rs, so skip |
| go-pmtiles | PMTiles CLI | protomaps/go-pmtiles | none | Go | BSD-3-Clause | v1.31.2 | skip | Go tool; the Aphrody stack avoids Go, so skip and use the PMTiles spec |
| graphhopper | Routing engine | GraphHopper/graphhopper | none | Java | Apache-2.0 | 11.1 | skip | Java router, duplicates Valhalla and OSRM; JVM is out of stack |
| osrm-backend | Routing engine | Project-OSRM/osrm-backend | none | C++ | BSD-2-Clause | v26.11.0 | pin | C++ fast routing engine, huge tree with heavy Boost deps |
| valhalla | Routing engine | valhalla/valhalla | none | C++ | NOASSERTION (repo LICENSE, MIT per upstream, not verified here) | 3.9.2 | pin | C++ routing/isochrone/map-matching engine; a candidate for C core third_party |
| PMTiles | Tile archive format | protomaps/PMTiles | none | TypeScript | NOASSERTION | none | absorb | Single-file tile archive spec plus JS client; a fit for Cloudflare R2 serving |
| tippecanoe | Tile builder | felt/tippecanoe | none | C++ | BSD-2-Clause | 2.79.0 | pin | C++ GeoJSON to vector tile builder, a C core third_party candidate |
| martin | Tile server (Rust) | maplibre/martin | none | Rust | Apache-2.0 | martin-v1.16.1 | absorb | Rust tile server for PostGIS and PMTiles; matches the Rust stack |
| OpenTripPlanner | Transit routing | opentripplanner/OpenTripPlanner | none | Java | NOASSERTION | v2.10.0 | reference | Java multimodal planner, a server; JVM is out of stack |
| openmaptiles | Vector tile schema | openmaptiles/openmaptiles | none | PLpgSQL | NOASSERTION (see repo LICENSE; code BSD, design CC-BY, per repo, not verified here) | v3.16 | reference | Vector tile schema and SQL, a spec for basemaps |
| openlayers | Web map library | openlayers/openlayers | none | JavaScript | BSD-2-Clause | v10.11.0 | absorb | JS web map SDK (ESM), a fit for the Bun/TS packages; WebGL layers |
| openstreetmap-website | web-app | openstreetmap/openstreetmap-website | none | Ruby | GPL-2.0 | no release; latest tag community-thread | skip | Rails app, off-stack |
| maplibre-gl-js | web-map | maplibre/maplibre-gl-js | none | TypeScript | NOASSERTION | v6.18.0 | pin | Mode fixed: 1 GB exceeds cap |

## graphics

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| VulkanMemoryAllocator | allocator | GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator | /gpuopen-librariesandsdks/vulkanmemoryallocator |  | MIT | v3.5.0 | absorb | single-header GPU allocator |
| Vulkan-Headers | C core third_party | KhronosGroup/Vulkan-Headers | /khronosgroup/vulkan-docs (no own id) |  | NOASSERTION | norel | pin | Vulkan API headers for C core/Chromium stack |
| Vulkan-ValidationLayers | C core third_party | KhronosGroup/Vulkan-ValidationLayers | none (resolve returned loader/tools ids only) |  | NOASSERTION | vulkan-sdk-1.4.363.1 | pin | validation for GPU tests; huge |
| OpenColorIO | color | AcademySoftwareFoundation/OpenColorIO | none (quota) |  | BSD-3-Clause | v2.6.0 | absorb | color management |
| OpenCL-SDK | compute | KhronosGroup/OpenCL-SDK | /khronosgroup/opencl-sdk |  | Apache-2.0 | v2026.05.29 | absorb | compute SDK (+OpenCL-Headers 892 KB, v2026.05.29) |
| OpenCV | cv | opencv/opencv | none (quota) |  | Apache-2.0 | 5.1.0 | pin | computer vision, 572 MB |
| Open Image Denoise | denoise | RenderKit/oidn | none (quota) |  | Apache-2.0 | v2.5.1 | absorb | ML denoiser, 35 MB |
| OpenSubdiv | geometry | PixarAnimationStudios/OpenSubdiv | none (quota) |  | NOASSERTION | v3_8_0 | pin | subdivision surfaces |
| Mesa | gl-vulkan-impl | gitlab.freedesktop.org/mesa/mesa | none | C | MIT | unknown | reference | Reference OpenGL/Vulkan driver stack; GitHub mesa3d/mesa API lookup failed, canonical forge is freedesktop GitLab; src/drivers/gpu/drm overlap |
| OpenEXR | image | AcademySoftwareFoundation/openexr | none (quota) |  | BSD-3-Clause | v3.5.4 | absorb | HDR image IO, moderate |
| OpenImageIO | image | AcademySoftwareFoundation/OpenImageIO | none (quota) |  | Apache-2.0 | v3.2.2.0 | pin | image IO, 200 MB |
| glad | loader generator | Dav1dde/glad | /dav1dde/glad |  | NOASSERTION | v2.0.8 | absorb | GL/Vulkan/EGL loader generator; small |
| volk | loader | zeux/volk | /zeux/volk |  | MIT | 1.4.350 | absorb | meta-loader, 823 KB |
| MaterialX | materials | AcademySoftwareFoundation/MaterialX | none (quota) |  | Apache-2.0 | v1.39.5 | pin | material interchange, 237 MB |
| assimp (Open Asset Import Library) | model import | assimp/assimp | none (quota) |  | NOASSERTION (BSD-3) | v6.0.6 | pin | model importer, 278 MB |
| Embree | raytracing | RenderKit/embree | none (quota) |  | Apache-2.0 | v4.4.1 | pin | CPU ray tracing kernels |
| OpenUSD | scene | PixarAnimationStudios/OpenUSD | none (lookup failed: quota) |  | NOASSERTION | v26.11.1 | pin | scene description; 300 MB C++ |
| glslang | shader | KhronosGroup/glslang | none (lookup failed: monthly quota exceeded) |  | NOASSERTION | 16.6.0 | pin | GLSL/HLSL to SPIR-V |
| SPIRV-Cross | shader | KhronosGroup/SPIRV-Cross | /khronosgroup/spirv-cross |  | Apache-2.0 | MoltenVK-1.1.5 | pin | SPIR-V to MSL/HLSL/GLSL; Chromium-pinned |
| SPIRV-Headers | shader | KhronosGroup/SPIRV-Headers | none (lookup not run, quota) |  | NOASSERTION | norel | pin | SPIR-V headers |
| SPIRV-Tools | shader | KhronosGroup/SPIRV-Tools | none (resolve returned spirv-cross ids) |  | Apache-2.0 | v2026.4 | pin | SPIR-V opt/val; Chromium-pinned |
| OpenShadingLanguage | shading | AcademySoftwareFoundation/OpenShadingLanguage | none (quota) |  | BSD-3-Clause | v1.15.8.0 | pin | offline renderer shading, LLVM-based |
| glTF | spec | KhronosGroup/glTF | none (lookup failed: quota) |  | NOASSERTION | v1.0-draft2 (stale tag) | reference | asset format spec; Sample-Assets (1.8 GB) skipped |
| Vulkan-Docs | spec | KhronosGroup/Vulkan-Docs | /khronosgroup/vulkan-docs |  | NOASSERTION | norel | reference | spec + vk.xml |
| OpenVDB | volumes | AcademySoftwareFoundation/openvdb | none (quota) |  | Apache-2.0 | v14.0.0 | pin | sparse volumes, heavy templates |
| GLFW | windowing | glfw/glfw | none | C | Zlib | 3.5.1 | absorb | OpenGL/Vulkan window and input C lib; small, fits C core |
| OpenXR-SDK | xr | KhronosGroup/OpenXR-SDK | /khronosgroup/openxr-sdk |  | Apache-2.0 | release-1.1.65 | absorb | XR loader/headers for engine |

## licensing

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| SPDX license-list-data | license-refs | spdx/license-list-data | /git-pkgs/spdx, /spdx/tools-python, /spdx/tools-golang | HTML | n/a | v3.29.0 | reference | License list reference (owner policy: licenses never drive architecture); 1.8GB so index only. OSI list itself not queried |

## media

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| OpenAL Soft | audio | kcat/openal-soft | none (quota) |  | NOASSERTION (LGPL) | 1.25.2 | absorb | 3D audio for engine |
| OpenH264 | codec | cisco/openh264 | none | C++ | BSD-2-Clause | v2.7.0 | pin | H.264 codec in the Chromium/WebRTC stack |
| OpenJPEG | codec | uclouvain/openjpeg | none | C | NOASSERTION | v2.5.4 | pin | JPEG 2000 codec, Chromium/PDFium dependency |

## platform-os

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| OpenEmbedded-Core | build-system | openembedded/openembedded-core | /openembedded/meta-openembedded | Python | NOASSERTION (MIT/GPL mix) | none | pin | Yocto/OE recipe base for image builds |
| Yocto Poky | build-system | yoctoproject/poky | /yoctoproject/poky (docs: /websites/yoctoproject) | none | none reported | none | pin | Yocto reference distro (mirror) |
| OpenStack (nova overview) | cloud | openstack/nova | /websites/openstack | Python | Apache-2.0 | none | reference | Overview only, cloud IaaS; irrelevant to Bun+Rust core |
| OpenHW CORE-V CVA6 | cpu-rtl | openhwgroup/cva6 | /openhwgroup/cv-hpdcache (related cache IP only) | Assembly | NOASSERTION (Solderpad) | v5.3.0 | pin | RISC-V 64 application core RTL; verif repo openhwgroup/core-v-verif (117MB, cv32e40p_v1.8.3) |
| OpenRISC or1k-src | cpu-toolchain | openrisc/or1k-src | none | C | GPL-2.0 | none | skip | Dead, last push 2016-03-12 |
| OpenWrt | embedded-linux | openwrt/openwrt | /openwrt/openwrt | C | NOASSERTION (GPL-2.0) | v25.12.6 | pin | Router/embedded Linux build system and ubus/procd model for OS layer |
| OpenZFS | filesystem | openzfs/zfs | /openzfs/zfs | C | NOASSERTION (CDDL) | zfs-2.4.4 | pin | Filesystem reference for fleet storage; large C tree |
| OpenCorePkg | firmware-bootloader | acidanthera/OpenCorePkg | none (not queried) | C | BSD-3-Clause | 1.0.8 | pin | UEFI bootloader for macOS; reference for boot chain |
| OpenSBI | firmware-riscv | riscv-software-src/opensbi | none (resolve returned unrelated openshift) | C | NOASSERTION (BSD-2-Clause) | v1.9 | absorb | Small RISC-V SBI firmware, 3.8MB |
| Open Compute Project | hardware-spec | opencomputeproject (org) | none | n/a | n/a | n/a | skip | Hardware specs, repo name guess Open-Compute-Project NOTFOUND on GitHub |
| Open MPI | hpc | open-mpi/ompi | /open-mpi/ompi | C | NOASSERTION (BSD-3-Clause) | none | pin | MPI for cluster compute, large C tree |
| OpenRC | init-system | OpenRC/openrc | none (resolve returned /xtls/xray-install, unrelated) | C | BSD-2-Clause | none | absorb | Small C init system, reference for Alpine-style service layer |
| OpenBSD src | os-kernel | openbsd/src | /openbsd/www (also /websites/man_openbsd_openbsd-current) | C | none reported by GitHub (BSD-style per file) | none | pin | Reference BSD kernel/libc/pf/OpenSSH origin; 1.6GB tree, pin only |
| OpenHarmony | os | openharmony/docs | none (not resolved) | Dockerfile | CC-BY-4.0 | none | reference | OS docs only; source lives on Gitee, GitHub org has docs only (4GB) |
| OpenMP examples/sources | parallel-spec | openmp/sources (spec examples); runtime in llvm/llvm-project | /openmp/examples, /openmp/sources | n/a | n/a | llvmorg-23.1.5 (llvm-project) | reference | Spec and examples; runtime ships inside LLVM already used by toolchain |
| OpenTitan | silicon-rot | lowRISC/opentitan | /lowrisc/opentitan | SystemVerilog | Apache-2.0 | Earlgrey-PROD-M6 | pin | Open silicon root of trust, SystemVerilog, large |

## security-net

| name | category | repo | Context7 | language | license | release | mode | relevance |
|---|---|---|---|---|---|---|---|---|
| openauth (anomalyco) | auth | anomalyco/openauth | /toolbeam/openauth | TypeScript | MIT | @openauthjs/openauth@0.4.3 | skip | openauthjs/openauth redirects to anomalyco/openauth, already in the 90 anomalyco repos |
| OpenFGA | authz | openfga/openfga | /openfga/openfga | Go | Apache-2.0 | v1.22.1 | pin | Go authz server; use JS SDK from Bun |
| OpenFGA js-sdk | authz | openfga/js-sdk | none | TypeScript | Apache-2.0 | v0.9.8 | absorb | Small TS client for OpenFGA |
| OpenSCAP | compliance | OpenSCAP/openscap | none | XSLT | LGPL-2.1 | 1.4.6 | skip | Linux compliance scanner, off-target for Bun+Rust |
| panva/jose | jwt | panva/jose | none (quota exceeded) | TypeScript | MIT | v6.2.17 | absorb | JOSE/JWT for Bun auth stack |
| OpenTelemetry Collector | observability | open-telemetry/opentelemetry-collector | none (quota exceeded) | Go | Apache-2.0 | v0.165.0 | pin | Go collector, run as service |
| OpenTelemetry JS | observability | open-telemetry/opentelemetry-js | /open-telemetry/opentelemetry-js | TypeScript | Apache-2.0 | v3.1.1 | absorb | Instrumentation for Bun packages |
| OpenTelemetry proto | observability | open-telemetry/opentelemetry-proto | none | Makefile | Apache-2.0 | v1.11.1 | reference | OTLP protobuf definitions, tiny |
| OpenTelemetry spec | observability | open-telemetry/opentelemetry-specification | none (quota exceeded) | Makefile | Apache-2.0 | v1.62.0 | reference | Spec only, markdown |
| OpenID AppAuth-JS | oidc | openid/AppAuth-JS | none | TypeScript | Apache-2.0 | none | absorb | Small OIDC/OAuth client SDK; OpenID Connect specs themselves are reference (openid.net) |
| panva/openid-client | oidc | panva/openid-client | none (quota exceeded) | TypeScript | MIT | v6.9.0 | absorb | Certified OIDC client for Bun/Node, small |
| OpenPGP.js | pgp | openpgpjs/openpgpjs | /openpgpjs/openpgpjs | JavaScript | LGPL-3.0 | v6.3.2 | absorb | JS OpenPGP for Bun; LGPL noted but licenses do not drive decisions |
| rPGP | pgp | rpgp/rpgp | none (quota exceeded before lookup) | Rust | Apache-2.0 | v0.21.1 | absorb | Pure-Rust OpenPGP, fits Rust crates workspace |
| Sequoia OpenPGP | pgp | gitlab.com/sequoia-pgp/sequoia | /gitlab_sequoia-pgp/sequoia | Rust | unknown (not read) | unknown | reference | Rust OpenPGP; GitHub sequoia-pgp/sequoia does not exist (gh NA), lives on GitLab; use rpgp for pure-Rust absorb |
| Open Policy Agent | policy | open-policy-agent/opa | /open-policy-agent/opa | Go | Apache-2.0 | v1.22.4 | pin | Policy engine, Go; repo size 3.7 GB (huge), pin only |
| liboqs (Open Quantum Safe) | pq-crypto | open-quantum-safe/liboqs | none (quota exceeded) | C | NOASSERTION (MIT-based) | 0.16.0 | pin | Post-quantum crypto C library for core third_party |
| OpenSearch | search | opensearch-project/OpenSearch | none (quota exceeded) | Java | Apache-2.0 | 3.9.0 | pin | Huge Java tree (629 MB), service only |
| OpenBao | secrets | openbao/openbao | /openbao/openbao | Go | MPL-2.0 | v2.7.2 | pin | Vault fork, large Go tree; run as service, not flattened |
| OpenSSF Scorecard | supply-chain | ossf/scorecard | none | Go | Apache-2.0 | v5.6.0 | pin | Supply-chain scoring Go CLI |
| OpenTelemetry Rust | telemetry | open-telemetry/opentelemetry-rust | /websites/opentelemetry_io (also /open-telemetry/opentelemetry-specification) | Rust | Apache-2.0 | opentelemetry-0.33.1 | absorb | Rust crate for the workspace, 11.8MB |
| BoringSSL | tls-crypto | google/boringssl | /google/boringssl | C++ | Apache-2.0 | 0.20261105.0 | pin | Chromium TLS; shared LLVM/Chromium stack |
| LibreSSL portable | tls-crypto | libressl/portable | none (only /websites/rs_openssl, unrelated) | C | NOASSERTION (ISC/OpenSSL mix) | v4.4.1 | pin | OpenBSD TLS fork; alternative to OpenSSL in the C core |
| rust-openssl | tls-crypto | rust-openssl/rust-openssl | none | Rust | none declared (MIT/Apache-2.0 in tree, not read) | openssl-v0.10.82 | pin | Rust bindings to OpenSSL; sfackler/rust-openssl moved to rust-openssl org |
| opentunnel | tunnel | opentunnel/opentunnel | none | none | none | none | skip | Seed repo does not exist on GitHub (gh api NA); Cloudflare tunnel/cloudflared already covers |
| Open vSwitch | virtual-switch | openvswitch/ovs | none | C | Apache-2.0 | none (tags only) | pin | Virtual switch, Linux fleet networking reference |
| OpenVPN | vpn | OpenVPN/openvpn | /openvpn/openvpn | C | NOASSERTION (GPL-2.0) | v2.7.9 | pin | VPN reference, GPL C |
| OpenVAS scan | vuln-scan | greenbone/openvas-scan | none | none | none | none | skip | gh api returned NA at that path; not pursued |
| OpenResty | web-server | openresty/openresty | none | C | NOASSERTION | v1.27.1.2 | absorb | nginx+LuaJIT bundle; reference for edge services |
| OpenZiti | zero-trust-network | openziti/ziti | none (quota exceeded) | Go | Apache-2.0 | v2.0.8 | pin | Zero-trust overlay network, Go |

## Absorb plan

- glfw/glfw
- openresty/openresty
- Dav1dde/glad
- zeux/volk
- GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator
- KhronosGroup/OpenCL-SDK
- KhronosGroup/OpenXR-SDK
- openai/harmony
- openai/tiktoken
- rpgp/rpgp
- OpenRC/openrc
- riscv-software-src/opensbi
- AcademySoftwareFoundation/OpenTimelineIO
- RenderKit/oidn
- AcademySoftwareFoundation/OpenColorIO
- AcademySoftwareFoundation/openexr
- kcat/openal-soft
- protomaps/PMTiles
- maplibre/martin
- apache/arrow-rs
- openlayers/openlayers
- openpgpjs/openpgpjs
- panva/jose
- panva/openid-client
- openid/AppAuth-JS
- openfga/js-sdk
- open-feature/js-sdk
- open-telemetry/opentelemetry-js
- Redocly/redocly-cli
- Redocly/redoc
- xtermjs/xterm.js
- OpenRouterTeam/ai-sdk-provider
- OpenRouterTeam/typescript-sdk
- OpenRouterTeam/typescript-agent
- OpenRouterTeam/sign-in-with-openrouter
- OpenRouterTeam/skills
- OpenRouterTeam/tool-bench
- OpenRouterTeam/benchmark-harness
- OpenRouterTeam/python-sdk
- OpenRouterTeam/go-sdk
- OpenRouterTeam/python-agent
- OpenRouterTeam/go-agent
- OpenRouterTeam/markdown-wasm
- OpenRouterTeam/openrouter-examples
- openai/openai-python
- openai/openai-agents-python
- openai/openai-realtime-agents
- openai/gpt-oss
- onnx/onnx
- huggingface/open-r1

## Pin plan

- openinterpreter/openinterpreter
- maplibre/maplibre-gl-js
- openstreetmap/iD
- anomalyco/opentui
- hey-api/openapi-ts
- openai/codex
- openai/openai-node
- openai/openai-agents-js
- anomalyco/opencode
- openai/openai-dotnet
- openssl/openssl
- openssh/openssh-portable
- libressl/portable
- google/boringssl
- rust-openssl/rust-openssl
- open-quantum-safe/liboqs
- KhronosGroup/Vulkan-Headers
- KhronosGroup/Vulkan-Loader
- KhronosGroup/Vulkan-ValidationLayers
- KhronosGroup/SPIRV-Tools
- KhronosGroup/SPIRV-Cross
- KhronosGroup/SPIRV-Headers
- KhronosGroup/glslang
- PixarAnimationStudios/OpenUSD
- AcademySoftwareFoundation/openvdb
- AcademySoftwareFoundation/OpenImageIO
- opencv/opencv
- cisco/openh264
- uclouvain/openjpeg
- openvswitch/ovs
- openxla/xla
- openvinotoolkit/openvino
- microsoft/onnxruntime
- openclaw/openclaw
- openbsd/src
- openwrt/openwrt
- openzfs/zfs
