// Bun plugin compiling .scss with Dart Sass (Angular Material's theming API is Sass). Used by the dev server
// (bunfig.toml [serve.static]) and by build.ts.
import type { BunPlugin } from "bun";
import { join } from "node:path";
import { compileAsync } from "sass";

const plugin: BunPlugin = {
  name: "sass",
  setup(build) {
    build.onLoad({ filter: /\.scss$/ }, async ({ path }) => {
      const r = await compileAsync(path, { loadPaths: [join(import.meta.dir, "node_modules")], style: "expanded", silenceDeprecations: [] });
      return { contents: r.css, loader: "css" };
    });
  },
};
export default plugin;
