# router-agent

The agent of the AI layer, assembled from Hugging Face's own pieces around ai-router:

| Part | Source |
|---|---|
| Agent loop (plan, call tools, stream) | `Agent` of `@huggingface/mcp-client` (the loop behind `tiny-agents`) |
| Model | ai-router through its C ABI (`packages/ai-router`), served to the loop as an OpenAI-compatible endpoint on loopback: local models first, then zero-cost offers, then the cheapest, with failover |
| Skills | any directory of Agent Skills (for example the `skills/` folder of [huggingface/skills](https://github.com/huggingface/skills)), offered through an MCP server with `list_skills` and `read_skill`, so a skill is read only when a task needs it |
| Hub tools | the Hugging Face MCP server, with `--hub` (authenticated with `HF_TOKEN` when set) |

```sh
bun src/cli.ts [--model auto|auto:local|auto:free|auto:cheap|<provider>/<model>] [--hub] "task"
```

The skills directory is `SKILLS_DIR` or `createAgent({ skillsDir })`; without one the agent runs without skills. Verified: with a local model on Windows, the agent listed the skills through MCP and answered from them.
