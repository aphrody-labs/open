---
name: bun-snippets-cli-run
description: "snippets/cli/run.mdx. Use when working with Bun: snippets/cli/run.mdx (bun docs snippets/cli/run.mdx)."
---

# snippets/cli/run.mdx

# CLI Usage

```bash
bun run <file or script>
```

### General Execution Options

- `--silent` (boolean): 
  Don't print the script command

- `--if-present` (boolean): 
  Exit without an error if the entrypoint does not exist

- `--eval` (string): 
  Evaluate argument as a script. Alias: <code>-e</code>

- `--print` (string): 
  Evaluate argument as a script and print the result. Alias: <code>-p</code>

- `--help` (boolean): 
  Display this menu and exit. Alias: <code>-h</code>

### Workspace Management

- `--elide-lines` (number), default `0`: 
  Truncate each script's output to its last N lines when using --filter. Default 0 shows all lines

- `--filter` (string): 
  Run a script in all workspace packages matching the pattern. Alias: <code>-F</code>

- `--workspaces` (boolean): 
  Run a script in all workspace packages (from the <code>workspaces</code> field in <code>package.json</code>)

- `--parallel` (boolean): 
  Run multiple scripts or workspace scripts concurrently with prefixed output

- `--sequential` (boolean): 
  Run multiple scripts or workspace scripts one after another with prefixed output

- `--no-exit-on-error` (boolean): 
  When using <code>--parallel</code> or <code>--sequential</code>, continue running other scripts when one fails

### Runtime &amp; Process Control

- `--bun` (boolean): 
  Force a script or package to use Bun's runtime instead of Node.js (via symlinking node). Alias: <code>-b</code>

- `--shell` (string): 
  Control the shell used for <code>package.json</code> scripts. Supports either <code>bun</code> or <code>system</code>

- `--interactive` (boolean): 
  Open the Node.js-compatible REPL (<code>node:repl</code>). When combined with <code>-e</code>, starts the REPL and
  then evaluates the script. Under <code>--interactive</code>, <code>-e</code> is raw JavaScript (matching{" "}
  <code>node -i -e</code>). Use <code>bun repl</code> for TypeScript. Distinct from <code>bun repl</code>, which is
  Bun's native REPL.

- `--smol` (boolean): 
  Use less memory, but run garbage collection more often

- `--aot` (boolean): 
  Check the program like <code>bun compile</code> does, then run it with built-in objects read-only

- `--aot-allow-code-from-disk` (boolean): 
  With <code>--aot</code>: check the program like <code>bun compile --aot-allow-code-from-disk</code> does

- `--expose-gc` (boolean): 
  Expose <code>gc()</code> on the global object. Has no effect on <code>Bun.gc()</code>

- `--no-deprecation` (boolean): 
  Silence all deprecation warnings

- `--throw-deprecation` (boolean): 
  Throw deprecation warnings as errors

- `--title` (string): 
  Set the process title

- `--zero-fill-buffers` (boolean): 
  Force <code>Buffer.allocUnsafe(size)</code> to be zero-filled

- `--no-addons` (boolean): 
  Throw an error if <code>process.dlopen</code> or <code>bun:ffi</code> <code>cc()</code> is called, and disable export
  condition <code>node-addons</code>

- `--no-ffi-cc` (boolean): 
  Throw an error if <code>bun:ffi</code> <code>cc()</code> is called (disables the C compiler)

- `--unhandled-rejections` (string): 
  One of <code>strict</code>, <code>throw</code>, <code>warn</code>, <code>none</code>, or{" "}
  <code>warn-with-error-code</code>

- `--console-depth` (number), default `2`: 
  Set the default depth for <code>console.log</code> object inspection (default: 2)

### Development Workflow

- `--check` (boolean): 
  Type check before running. Nothing runs if there are type errors. See <a href="/runtime/check">bun check</a>

- `--watch` (boolean): 
  Automatically restart the process on file change

- `--watch-kill-signal` (string), default `SIGTERM`: 
  Signal whose handlers run when --watch restarts the process

- `--hot` (boolean): 
  Enable auto reload in the Bun runtime, test runner, or bundler

- `--no-clear-screen` (boolean): 
  Disable clearing the terminal screen on reload when --hot or --watch is enabled

### Debugging

- `--inspect` (string): 
  Activate Bun's debugger

- `--inspect-wait` (string): 
  Activate Bun's debugger, wait for a connection before executing

- `--inspect-brk` (string): 
  Activate Bun's debugger, set breakpoint on first line of code and wait

### Dependency &amp; Module Resolution

- `--preload` (string): 
  Import a module before Bun loads other modules. Alias: <code>-r</code>

- `--require` (string): 
  Alias of --preload, for Node.js compatibility

- `--import` (string): 
  Alias of --preload, for Node.js compatibility

- `--no-install` (boolean): 
  Disable auto install in the Bun runtime

- `--install` (string), default `auto`: 
  Configure auto-install behavior. One of <code>auto</code> (default, auto-installs when no node_modules),{" "}
  <code>fallback</code> (missing packages only), <code>force</code> (always)

- `-i` (boolean): 
  Auto-install dependencies during execution. Equivalent to --install=fallback

- `--prefer-offline` (boolean): 
  Skip staleness checks for packages in the Bun runtime and resolve from disk

- `--prefer-latest` (boolean): 
  Use the latest matching versions of packages in the Bun runtime, always checking npm

- `--conditions` (string): 
  Pass custom conditions to resolve

- `--main-fields` (string): 
  Main fields to lookup in <code>package.json</code>

- `--preserve-symlinks` (boolean): 
  Preserve symlinks when resolving files

- `--preserve-symlinks-main` (boolean): 
  Preserve symlinks when resolving the main entry point

- `--extension-order` (string), default `.tsx,.ts,.jsx,.cts,.cjs,.js,.mjs,.mts,.json,.node`: 
  Defaults to: <code>.tsx,.ts,.jsx,.cts,.cjs,.js,.mjs,.mts,.json,.node</code>

### Transpilation &amp; Language Features

- `--tsconfig-override` (string): 
  Specify custom <code>tsconfig.json</code>. Default <code>$cwd/tsconfig.json</code>

- `--define` (string): 
  Substitute K:V while parsing, e.g. <code>--define process.env.NODE_ENV:"development"</code>. Bun parses values as
  JSON. Alias: <code>-d</code>

- `--drop` (string): 
  Remove function calls, e.g. <code>--drop=console</code> removes all <code>console.*</code> calls

- `--loader` (string): 
  Parse files with <code>.ext:loader</code>, e.g. <code>--loader .js:jsx</code>. Valid loaders: <code>js</code>,{" "}
  <code>jsx</code>, <code>ts</code>, <code>tsx</code>, <code>json</code>, <code>toml</code>, <code>text</code>,{" "}
  <code>file</code>, <code>wasm</code>, <code>napi</code>. Alias: <code>-l</code>

- `--no-macros` (boolean): 
  Disable macro execution in the bundler, transpiler and runtime

- `--jsx-factory` (string): 
  Changes the function called when compiling JSX elements using the classic JSX runtime

- `--jsx-fragment` (string): 
  Changes the function called when compiling JSX fragments

- `--jsx-import-source` (string), default `react`: 
  Declares the module specifier used to import the jsx and jsxs factory functions. Default: <code>react</code>

- `--jsx-runtime` (string), default `automatic`: 
  <code>automatic</code> (default) or <code>classic</code>

- `--jsx-side-effects` (boolean): 
  Treat JSX elements as having side effects (disable pure annotations)

- `--ignore-dce-annotations` (boolean): 
  Ignore tree-shaking annotations such as <code>@__PURE__</code>

### Networking &amp; Security

- `--port` (number): 
  Set the default port for <code>Bun.serve</code>

- `--fetch-preconnect` (string): 
  Preconnect to a URL while code is loading

- `--max-http-header-size` (number), default `16384`: 
  Set the maximum size of HTTP headers in bytes. Default is 16KiB

- `--dns-result-order` (string), default `verbatim`: 
  Set the default order of DNS lookup results. Valid orders: <code>verbatim</code> (default), <code>ipv4first</code>,{" "}
  <code>ipv6first</code>

- `--use-system-ca` (boolean): 
  Use the system's trusted certificate authorities

- `--use-openssl-ca` (boolean): 
  Use OpenSSL's default CA store instead of the bundled one

- `--use-bundled-ca` (boolean): 
  Use bundled CA store

- `--redis-preconnect` (boolean): 
  Preconnect to <code>$REDIS_URL</code> at startup

- `--sql-preconnect` (boolean): 
  Preconnect to PostgreSQL at startup

- `--user-agent` (string): 
  Set the default User-Agent header for HTTP requests

### Global Configuration &amp; Context

- `--env-file` (string): 
  Load environment variables from the specified file(s)

- `--cwd` (string): 
  Absolute path to resolve files &amp; entrypoints from. This only changes the process' cwd

- `--config` (string): 
  Specify path to Bun config file. Default <code>$cwd/bunfig.toml</code>. Alias: <code>-c</code>

## Examples

Run a JavaScript or TypeScript file:

```bash
bun run ./index.js
bun run ./index.tsx
```

Run a package.json script:

```bash
bun run dev
bun run lint
```
