#!/usr/bin/env bun
// browser-engines engines <list|matrix|channels|path|install|launch|backend> ...
import { runEnginesCommand } from "./engines/cli.ts";

const [cmd = "help", ...rest] = process.argv.slice(2);
if (cmd === "engines") process.exitCode = await runEnginesCommand(rest);
else {
  console.log("browser-engines engines <list|matrix|channels|path|install|launch|backend> [...]   (engines help for details)");
  process.exitCode = cmd === "help" ? 0 : 1;
}
