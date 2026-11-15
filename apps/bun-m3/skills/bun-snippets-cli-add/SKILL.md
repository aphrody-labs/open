---
name: bun-snippets-cli-add
description: "snippets/cli/add.mdx. Use when working with Bun: snippets/cli/add.mdx (bun docs snippets/cli/add.mdx)."
---

# snippets/cli/add.mdx

## CLI Usage

```bash
bun add <package> <@version>
```

### Dependency Management

- `--production` (boolean): 
  Don't install devDependencies. Alias: <code>-p</code>

- `--omit` (string): 
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install

- `--global` (boolean): 
  Install globally. Alias: <code>-g</code>

- `--dev` (boolean): 
  Add dependency to <code>devDependencies</code>. Alias: <code>-d</code>

- `--optional` (boolean): 
  Add dependency to <code>optionalDependencies</code>

- `--peer` (boolean): 
  Add dependency to <code>peerDependencies</code>

- `--save-prod` (boolean): 
  Add dependency to <code>dependencies</code>, also when another group lists it

- `--exact` (boolean): 
  Add the exact version instead of the <code>^</code> range. Alias: <code>-E</code>

- `--only-missing` (boolean): 
  Only add dependencies to <code>package.json</code> if they are not already present

- `--catalog` (string): 
  Add the resolved version to the root <code>package.json</code> catalog and depend on it as <code>catalog:</code>;{" "}
  <code>--catalog=NAME</code> targets <code>catalogs.NAME</code>

- `--filter` (string): 
  Add the package(s) to the matching workspaces instead of the current package. Alias: <code>-F</code>

### Project Files & Lockfiles

- `--yarn` (boolean): 
  Write a <code>yarn.lock</code> file (yarn v1). Alias: <code>-y</code>

- `--no-save` (boolean): 
  Don't update <code>package.json</code> or save a lockfile

- `--save` (boolean), default `true`: 
  Save to <code>package.json</code>

- `--frozen-lockfile` (boolean): 
  Disallow changes to lockfile

- `--trust` (boolean): 
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the package(s)

- `--save-text-lockfile` (boolean): 
  Save a text-based lockfile

- `--lockfile-only` (boolean): 
  Generate a lockfile without installing dependencies

### Installation Control

- `--dry-run` (boolean): 
  Resolve the packages but don't install them, update an existing <code>package.json</code>, save a lockfile, or run the
  project's lifecycle scripts

- `--force` (boolean): 
  Always request the latest versions from the registry &amp; reinstall all dependencies. Alias: <code>-f</code>

- `--no-verify` (boolean): 
  Skip verifying integrity of newly downloaded packages

- `--ignore-scripts` (boolean): 
  Skip lifecycle scripts for all packages, including the project's <code>package.json</code> and trusted dependencies

- `--analyze` (boolean): 
  Recursively analyze &amp; install dependencies of files passed as arguments (using Bun's bundler). Alias:{" "}
  <code>-a</code>

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
  Use a specific registry by default, overriding <code>.npmrc</code>, <code>bunfig.toml</code>, and environment
  variables

- `--network-concurrency` (number), default `64`: 
  Maximum number of concurrent network requests

### Performance &amp; Resource

- `--backend` (string): 
  Platform-specific optimizations for installing dependencies. Possible values: <code>clonefile</code> (default on
  macOS), <code>hardlink</code> (default on Linux and Windows), <code>symlink</code>, <code>copyfile</code>

- `--concurrent-scripts` (number): 
  Maximum number of concurrent jobs for lifecycle scripts (default: 2x CPU cores)

### Caching

- `--cache-dir` (string): 
  Store &amp; load cached data from a specific directory path

- `--no-cache` (boolean): 
  Ignore manifest cache entirely

### Output &amp; Logging

- `--silent` (boolean): 
  Don't log anything

- `--verbose` (boolean): 
  Excessively verbose logging

- `--no-progress` (boolean): 
  Disable the progress bar

- `--no-summary` (boolean): 
  Don't print a summary

### Global Configuration &amp; Context

- `--config` (string): 
  Specify path to config file (<code>bunfig.toml</code>). Alias: <code>-c</code>

- `--cwd` (string): 
  Set a specific current working directory

- `--env-file` (string): 
  Load environment variables from the specified file(s)

- `--no-env-file` (boolean): 
  Disable automatic loading of .env files

### Help

- `--help` (boolean): 
  Print this help menu. Alias: <code>-h</code>
