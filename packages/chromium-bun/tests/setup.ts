// Tests run against a fixed topology, not the host's deployment file.
import { join } from "node:path";
process.env.CHROMIUM_BUN_TOPOLOGY = join(import.meta.dir, "fixtures", "topology.toml");
