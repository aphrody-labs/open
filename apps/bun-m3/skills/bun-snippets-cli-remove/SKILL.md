---
name: bun-snippets-cli-remove
description: "snippets/cli/remove.mdx. Use when working with Bun: snippets/cli/remove.mdx (bun docs snippets/cli/remove.mdx)."
---

# snippets/cli/remove.mdx

## CLI Usage

```bash terminal icon="terminal"
bun remove <package>
```

### General Information

- `--help` (boolean): 
  Print this help menu. Alias: <code>-h</code>

### Configuration

- `--config` (string): 
  Specify path to config file (<code>bunfig.toml</code>). Alias: <code>-c</code>

### Package.json Interaction

- `--no-save` (boolean): 
  Don't update <code>package.json</code> or save a lockfile

- `--save` (boolean), default `true`: 
  Save to <code>package.json</code> (true by default)

- `--trust` (boolean): 
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the package(s)

- `--filter` (string): 
  Remove the package(s) from the matching workspaces instead of the current package. Alias: <code>-F</code>

### Lockfile Behavior

- `--yarn` (boolean): 
  Write a <code>yarn.lock</code> file (yarn v1). Alias: <code>-y</code>

- `--frozen-lockfile` (boolean): 
  Disallow changes to lockfile

- `--save-text-lockfile` (boolean): 
  Save a text-based lockfile

- `--lockfile-only` (boolean): 
  Generate a lockfile without installing dependencies

### Dependency Filtering

- `--production` (boolean): 
  Don't install devDependencies. Alias: <code>-p</code>

- `--omit` (string): 
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install

### Network & Registry

- `--ca` (string): 
  Provide a Certificate Authority signing certificate

- `--cafile` (string): 
  Same as <code>--ca</code>, but as a file path to the certificate

- `--use-system-ca` (boolean): 
  Use the system's trusted certificate authorities

- `--use-openssl-ca` (boolean): 
  Use OpenSSL's default CA store instead of the bundled one

- `--use-bundled-ca` (boolean): 
  Use bundled CA store

- `--registry` (string): 
  Use a specific registry by default, overriding <code>.npmrc</code>, <code>bunfig.toml</code> and environment variables

### Execution Control & Validation

- `--dry-run` (boolean): 
  Resolve the change but don't remove packages, update <code>package.json</code>, save a lockfile, or run the project's
  lifecycle scripts

- `--force` (boolean): 
  Always request the latest versions from the registry &amp; reinstall all dependencies. Alias: <code>-f</code>

- `--no-verify` (boolean): 
  Skip verifying integrity of newly downloaded packages

### Output & Logging

- `--silent` (boolean): 
  Don't log anything

- `--verbose` (boolean): 
  Excessively verbose logging

- `--no-progress` (boolean): 
  Disable the progress bar

- `--no-summary` (boolean): 
  Don't print a summary

### Caching

- `--cache-dir` (string): 
  Store &amp; load cached data from a specific directory path

- `--no-cache` (boolean): 
  Ignore manifest cache entirely

### Script Execution

- `--ignore-scripts` (boolean): 
  Skip lifecycle scripts for all packages, including the project's <code>package.json</code> and trusted dependencies

- `--concurrent-scripts` (number): 
  Maximum number of concurrent jobs for lifecycle scripts (default: 2x CPU cores)

### Scope & Path

- `--global` (boolean): 
  Install globally. Alias: <code>-g</code>

- `--cwd` (string): 
  Set a specific cwd

- `--env-file` (string): 
  Load environment variables from the specified file(s)

- `--no-env-file` (boolean): 
  Disable automatic loading of .env files

### Advanced & Performance

- `--backend` (string): 
  Platform-specific optimizations for installing dependencies. Possible values: <code>clonefile</code> (default on
  macOS), <code>hardlink</code> (default on Linux and Windows), <code>symlink</code>, <code>copyfile</code>

- `--network-concurrency` (number), default `64`: 
  Maximum number of concurrent network requests (default 64)
