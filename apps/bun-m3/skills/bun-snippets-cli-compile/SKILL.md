---
name: bun-snippets-cli-compile
description: "snippets/cli/compile.mdx. Use when working with Bun: snippets/cli/compile.mdx (bun docs snippets/cli/compile.mdx)."
---

# snippets/cli/compile.mdx

## CLI Usage

```bash
bun compile [flags] [entry point]
```

`bun compile` takes every flag of [`bun build`](/bundler#cli-usage), and these. If `package.json` has a `"compile"` script, it runs that script instead.

The entry point is a file, or the name of a command-line tool of an installed package, such as `rollup`.

### Output

- `--outfile` (string): 
  Write the executable to this path

- `--target` (string): 
  The platform to build for, such as <code>bun-linux-x64</code>. <code>bun compile</code> only builds for the platform
  it runs on. Add <code>--no-aot</code> to build for another one

- `--asset` (string): 
  Embed a file or directory into the executable, preserving its relative path. Can be repeated

- `--compile-exec-argv` (string): 
  Prepend arguments to the executable's <code>process.execArgv</code>

### Compiling ahead of time

- `--no-aot` (boolean): 
  Bundle the JavaScript into the executable instead of compiling it to machine code, like bun build --compile

- `--explain` (string): 
  List the code that compiled to a slow path, worst first, with a fix for each. <code>--explain=json</code> prints one
  object per line. Other reports: <code>guards</code>, <code>guards-json</code>, <code>trim</code>,{" "}
  <code>allocations</code>

- `--no-compile-function-source` (boolean): 
  Don't embed function source code. <code>fn.toString()</code> returns <code>[native code]</code>

- `--obfuscate` (boolean): 
  Strip function names and source locations from the executable and write them to <code>&lt;outfile&gt;.map</code>. The{" "}
  <code>name</code> of every function and class is empty

- `--compile-inspector` (boolean): 
  Let a debugger attach to the executable. Makes it larger and slower

- `--aot-allow-code-from-disk` (boolean): 
  Let <code>import()</code>, <code>require()</code> and <code>new Worker()</code> load code that isn't in the executable
  from disk at run time. Makes it larger and slower

- `--aot-harden` (string): 
  Make a bug in the compiler harder to turn into a memory bug. Takes a list of <code>proof-checks</code> and{" "}
  <code>ignore-told-ranges</code>. The executable runs slower

- `--compile-in-place` (boolean): 
  Keep modules at their paths on disk and load anything that wasn't compiled from there. The executable only runs on the
  machine that built it

- `--aot-huge-heap` (boolean): 
  Remove the 32 GB heap limit per thread. The executable uses more memory and runs slower

- `--disallow-code-generation-from-strings` (string): 
  In the executable, <code>eval()</code> and <code>new Function()</code> throw an <code>EvalError</code>.{" "}
  <code>=strict</code> also blocks every other way to run code from a string

### Size

- `--trim` (boolean): 
  Remove the Bun and Node.js APIs your code never calls

- `--trim-locales` (string): 
  Keep only these locales, such as <code>en,de-AT</code>. Implies <code>--trim</code>

### Libraries

```bash
bun compile --library [flags] [entry points]
```

Builds [a package to publish](/compiler/libraries) instead of an executable. Without an entry point, it builds the TypeScript files that `"exports"` in `package.json` points to. `dependencies` stay imports, and `devDependencies` are bundled.

- `--library` (boolean): 
  Build a package to publish instead of an executable

- `--outdir` (string), default `dist`: 
  The folder to write the package to. It cannot be the project's own folder

- `--target` (string), default `node`: 
  With <code>--library</code>: <code>node</code>, <code>browser</code> or <code>bun</code>

- `--format` (string), default `esm`: 
  With <code>--library</code>: <code>esm</code> or <code>cjs</code>. A <code>cjs</code> package has no{" "}
  <code>.aot.ts</code> files

### Scripts

- `--no-script` (boolean): 
  Run this command even if <code>package.json</code> has a <code>"compile"</code> script
