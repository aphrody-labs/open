---
name: bun-snippets-cli-build
description: "snippets/cli/build.mdx. Use when working with Bun: snippets/cli/build.mdx (bun docs snippets/cli/build.mdx)."
---

# snippets/cli/build.mdx

## CLI Usage

```bash
bun build <entry points>
```

### General Configuration

- `--production` (boolean): 
  Set <code>NODE_ENV=production</code> and enable minification

- `--bytecode` (boolean): 
  Use a bytecode cache when compiling

- `--bytecode-depth` (number): 
  How many levels of nested functions to compile to bytecode ahead of time (a non-negative integer). Defaults to all

- `--no-optimize-bytecode` (boolean): 
  With <code>--bytecode</code>: skip the build-time bytecode optimization passes

- `--bytecode-order` (string): 
  With <code>--compile --bytecode</code>: lay the bytecode out by the order files that a run of the executable wrote
  with <code>BUN_BYTECODE_ORDER_OUT</code>. Comma-separated or repeated, most important first

- `--target` (string), default `browser`: 
  Intended execution environment for the bundle. One of <code>browser</code>, <code>bun</code>, or <code>node</code>

- `--conditions` (string): 
  Pass custom resolution conditions

- `--env` (string), default `disable`: 
  Inline environment variables into the bundle as <code>process.env.${name}</code>. To inline variables matching a
  prefix, use a glob like <code>FOO_PUBLIC_*</code>

### Output & File Handling

- `--outdir` (string), default `dist`: 
  Output directory (used when building multiple entry points)

- `--outfile` (string): 
  Write output to a specific file

- `--metafile` (string): 
  Write a JSON file with metadata about the build

- `--metafile-md` (string): 
  Write a markdown file with a visualization of the module graph (LLM-friendly)

- `--sourcemap` (string), default `none`: 
  Generate source maps. One of <code>linked</code>, <code>inline</code>, <code>external</code>, or <code>none</code>.
  With <code>--aot</code>, only <code>external</code> has an effect. It does what <code>--obfuscate</code> does, but
  functions and classes keep their <code>name</code>

- `--banner` (string): 
  Add a banner to the output (e.g. <code>"use client"</code> for React Server Components)

- `--footer` (string): 
  Add a footer to the output (e.g. <code>// built with bun!</code>)

- `--format` (string), default `esm`: 
  Module format of the output bundle. One of <code>esm</code>, <code>cjs</code>, or <code>iife</code>. Defaults to{" "}
  <code>cjs</code> when <code>--bytecode</code> is used.

### File Naming

- `--entry-naming` (string), default `[dir]/[name].[ext]`: 
  Customize entry point filenames

- `--chunk-naming` (string), default `[name]-[hash].[ext]`: 
  Customize chunk filenames

- `--asset-naming` (string), default `[name]-[hash].[ext]`: 
  Customize asset filenames

### Bundling Options

- `--root` (string): 
  Root directory used when bundling multiple entry points

- `--splitting` (boolean): 
  Enable code splitting for shared modules

- `--min-chunk-size` (number): 
  With `--splitting`, also fold side-effect-free chunks smaller than this many source bytes into a chunk loaded by a
  superset of their importers

- `--no-module-preload` (boolean): 
  With `--splitting` and `--target browser`, don't emit `<link rel="modulepreload">` for the chunks an entrypoint or
  `import()` depends on

- `--public-path` (string): 
  Prefix the bundler adds to import paths in bundled code

- `--external` (string): 
  Exclude modules from the bundle (supports wildcards). Alias: <code>-e</code>

- `--allow-unresolved` (string), default `*`: 
  Allow unresolved dynamic import()/require() specifiers matching these glob patterns. Pass <code>''</code> to allow
  opaque specifiers

- `--reject-unresolved` (boolean): 
  Fail the build on any dynamic import()/require() specifier that cannot be resolved at build time

- `--packages` (string), default `bundle`: 
  How to treat dependencies: <code>external</code> or <code>bundle</code>

- `--no-bundle` (boolean): 
  Transpile only — do not bundle

- `--css-chunking` (boolean): 
  Chunk CSS files together to reduce duplication (only when multiple entry points import CSS)

### Minification & Optimization

- `--emit-dce-annotations` (boolean), default `true`: 
  Re-emit Dead Code Elimination annotations. Disabled when <code>--minify-whitespace</code> is used

- `--no-deprecated-namespace-object-setters` (boolean): 
  Emit getter-only module namespace objects (assigning to a property throws, like a real namespace). This becomes the
  default in a future release

- `--minify` (boolean): 
  Enable all minification options

- `--minify-syntax` (boolean): 
  Minify syntax and inline constants

- `--minify-whitespace` (boolean): 
  Minify whitespace

- `--minify-identifiers` (boolean): 
  Minify variable and function identifiers

- `--keep-names` (boolean): 
  Preserve original function and class names when minifying

### Development Features

- `--check` (boolean): 
  Type check the entry points and everything they import. Nothing is bundled if there are type errors

- `--dts` (boolean): 
  Write declaration files (<code>.d.ts</code>), and each output file with its types kept (<code>.aot.ts</code>), to{" "}
  <code>--outdir</code>. Implies <code>--check</code>

- `--watch` (boolean): 
  Rebuild automatically when files change

- `--no-clear-screen` (boolean): 
  Don’t clear the terminal when rebuilding with <code>--watch</code>

- `--react-fast-refresh` (boolean): 
  Enable React Fast Refresh transform (for development testing)

- `--react-compiler` (boolean): 
  Run the React Compiler over `.jsx`/`.tsx` files, automatically memoizing components and hooks. The bundler derives the
  output mode from `--target` (`browser` → client, `bun`/`node` → ssr). Experimental.

### Standalone Executables

- `--compile` (boolean): 
  Generate a standalone Bun executable containing the bundle

- `--compile-exec-argv` (string): 
  Prepend arguments to the standalone executable’s <code>execArgv</code>

- `--disallow-code-generation-from-strings` (string): 
  In the standalone executable, <code>eval()</code> and <code>new Function()</code> throw an <code>EvalError</code>,
  like Node.js's flag of the same name. <code>=strict</code> also blocks every other way to run code from a string.
  Requires <code>--compile</code>

- `--aot` (boolean): 
  Compile JavaScript and TypeScript to machine code at build time. Requires <code>--compile</code>.{" "}
  <code>--format</code> and <code>--bytecode</code> have no effect with it

- `--explain` (string): 
  With <code>--aot</code>: list the code that compiled to a slow path, worst first, with a fix for each.{" "}
  <code>--explain=json</code> prints one object per line. Other reports: <code>guards</code>, <code>guards-json</code>,{" "}
  <code>trim</code>, <code>allocations</code>

- `--aot-huge-heap` (boolean): 
  With <code>--aot</code>: remove the 32 GB heap limit per thread. The executable uses more memory and runs slower

- `--no-compile-function-source` (boolean): 
  With <code>--aot</code>: don't embed function source code. <code>fn.toString()</code> returns{" "}
  <code>[native code]</code>

- `--compile-inspector` (boolean): 
  With <code>--aot</code>: let a debugger attach to the executable. Makes it larger and slower

- `--aot-allow-code-from-disk` (boolean): 
  With <code>--aot</code>: let <code>import()</code>, <code>require()</code> and <code>new Worker()</code> load code
  that isn't in the executable from disk at run time. Makes it larger and slower

- `--aot-harden` (string): 
  With <code>--aot</code>: make a bug in the compiler harder to turn into a memory bug. Takes a list of{" "}
  <code>proof-checks</code> and <code>ignore-told-ranges</code>. The executable runs slower

- `--compile-in-place` (boolean): 
  With <code>--aot</code>: keep modules at their paths on disk and load anything that wasn't compiled from there. The
  executable only runs on the machine that built it

- `--obfuscate` (boolean): 
  With <code>--aot</code>: strip function names and source locations from the executable and write them to{" "}
  <code>&lt;outfile&gt;.map</code>. The <code>name</code> of every function and class is empty, and{" "}
  <code>fn.toString()</code> returns <code>[native code]</code>

- `--trim` (boolean): 
  Remove the Bun and Node.js APIs your code never calls from the executable. Requires <code>--compile</code>

- `--trim-locales` (string): 
  Keep only these locales, such as <code>en,de-AT</code>. Implies <code>--trim</code>

- `--compile-jit-policy` (number), default `1`: 
  JIT tier-up threshold scale the executable starts with; <code>1</code> is the normal JIT policy. See
  <code>Bun.unsafe.setJITPolicy</code>

- `--compile-autoload-dotenv` (boolean), default `true`: 
  Enable autoloading of <code>.env</code> files in the standalone executable

- `--no-compile-autoload-dotenv` (boolean): 
  Disable autoloading of <code>.env</code> files in the standalone executable

- `--compile-autoload-bunfig` (boolean), default `true`: 
  Enable autoloading of <code>bunfig.toml</code> in the standalone executable

- `--no-compile-autoload-bunfig` (boolean): 
  Disable autoloading of <code>bunfig.toml</code> in the standalone executable

- `--compile-autoload-tsconfig` (boolean), default `false`: 
  Enable autoloading of <code>tsconfig.json</code> at runtime in the standalone executable

- `--no-compile-autoload-tsconfig` (boolean): 
  Disable autoloading of <code>tsconfig.json</code> at runtime in the standalone executable

- `--compile-autoload-package-json` (boolean), default `false`: 
  Enable autoloading of <code>package.json</code> at runtime in the standalone executable

- `--no-compile-autoload-package-json` (boolean): 
  Disable autoloading of <code>package.json</code> at runtime in the standalone executable

- `--compile-executable-path` (string): 
  Path to a Bun executable to use for cross-compilation instead of downloading

- `--asset` (string): 
  Embed a file or directory into the compiled executable under its basename; a directory keeps its internal tree, so{" "}
  <code>--asset ./static/public</code> embeds <code>public/...</code> (requires <code>--compile</code>)

### Windows Executable Details

- `--windows-hide-console` (boolean): 
  Prevent a console window from opening when running a compiled Windows executable

- `--windows-icon` (string): 
  Set an icon for the Windows executable

- `--windows-title` (string): 
  Set the Windows executable product name

- `--windows-publisher` (string): 
  Set the Windows executable company name

- `--windows-version` (string): 
  Set the Windows executable version (e.g. <code>1.2.3.4</code>)

- `--windows-description` (string): 
  Set the Windows executable description

- `--windows-copyright` (string): 
  Set the Windows executable copyright notice

### Experimental & App Building

- `--app` (boolean): 
  <b>(EXPERIMENTAL)</b> Build a web app for production using Bun Bake

- `--debug-dump-server-files` (boolean): 
  When <code>--app</code> is set, dump all server files to disk even for static builds

- `--debug-no-minify` (boolean): 
  When <code>--app</code> is set, disable all minification
