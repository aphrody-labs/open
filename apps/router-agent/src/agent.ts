// The agent of the AI layer: Hugging Face's MCP agent loop (@huggingface/mcp-client), ai-router as its model, the
// Hugging Face skills through the skills MCP server, and the Hugging Face MCP server for the Hub.
import { Agent } from "@huggingface/mcp-client";
import type { RouterConfig } from "../../../packages/ai-router/src/index.ts";
import { serveModel } from "./model-endpoint.ts";

export interface AgentOptions {
  /** Router policy or offer id (auto, auto:local, auto:free, auto:cheap, <provider>/<model>). */
  model?: string;
  router?: RouterConfig;
  /** Skills directory for the skills MCP server; the absorbed Hugging Face skills by default. */
  skillsDir?: string;
  /** Also connect the Hugging Face MCP server (Hub search, Spaces, papers); with HF_TOKEN when set. */
  hub?: boolean;
}

const PROMPT = `You are an agent: keep going until the user's request is fully resolved, then call task_complete.
Skills hold the procedures for specific tasks. Call list_skills to see them, and read_skill to read the one a task needs before doing it. Do not guess what a skill says.
Use tools to gather facts instead of making them up.`;

export async function createAgent(o: AgentOptions = {}) {
  const model = serveModel(o.router ?? {});
  const servers: ConstructorParameters<typeof Agent>[0]["servers"] = [
    { type: "stdio", config: { command: process.execPath, args: [new URL("./skills-mcp.ts", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), ...(o.skillsDir ? ["--dir", o.skillsDir] : [])] } },
  ];
  if (o.hub) {
    const token = Bun.env.HF_TOKEN;
    servers.push({ type: "http", config: { url: "https://huggingface.co/mcp", options: token ? { requestInit: { headers: { Authorization: `Bearer ${token}` } } } : {} } });
  }
  const agent = new Agent({ endpointUrl: `${model.url.origin}/v1`, model: o.model ?? "auto", servers, prompt: PROMPT });
  await agent.loadTools();
  return { agent, close: async () => (await agent.cleanup(), model.stop(true)) };
}
