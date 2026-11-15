#!/usr/bin/env bun
// router-agent [--model <policy or id>] [--hub] <task...>
// Streams the answer; tool calls and their results are shown on stderr.
import { createAgent } from "./agent.ts";

const argv = Bun.argv.slice(2);
const take = (f: string) => (argv.includes(f) ? argv.splice(argv.indexOf(f), 2)[1] : undefined);
const model = take("--model");
const hub = argv.includes("--hub") ? (argv.splice(argv.indexOf("--hub"), 1), true) : false;
const task = argv.join(" ") || (await Bun.stdin.text());
const { agent, close } = await createAgent({ model, hub, router: { local: Bun.env.AI_ROUTER_LOCAL?.split(",").filter(Boolean) } });
try {
  for await (const step of agent.run(task)) {
    if ("choices" in step) {
      const d = step.choices[0]?.delta;
      if (d?.content) process.stdout.write(d.content);
      for (const c of d?.tool_calls ?? []) if (c.function?.name) process.stderr.write(`\n[tool] ${c.function.name}\n`);
    } else if (step.role === "tool") {
      process.stderr.write(`[${step.name}] ${String(step.content).slice(0, 200).replace(/\s+/g, " ")}\n`);
    }
  }
  process.stdout.write("\n");
} finally {
  await close();
}
