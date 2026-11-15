---
name: bun-snippets-cli-outdated
description: "snippets/cli/outdated.mdx. Use when working with Bun: snippets/cli/outdated.mdx (bun docs snippets/cli/outdated.mdx)."
---

# snippets/cli/outdated.mdx

## CLI Usage

```bash terminal icon="terminal"
bun outdated <filter>
```

### General Options

- `-c, --config` (string): 
  Specify path to config file (<code>bunfig.toml</code>)

- `--cwd` (string): 
  Set a specific cwd

- `--env-file` (string): 
  Load environment variables from the specified file(s)

- `--no-env-file` (boolean): 
  Disable automatic loading of .env files

- `-h, --help` (boolean): 
  Print this help menu

- `-F, --filter` (string): 
  Display outdated dependencies for each matching workspace

- `-r, --recursive` (boolean): 
  Check outdated packages in all workspaces

### Output & Logging

- `--silent` (boolean): 
  Don't log anything

- `--verbose` (boolean): 
  Excessively verbose logging

- `--no-progress` (boolean): 
  Disable the progress bar

- `--no-summary` (boolean): 
  Don't print a summary

### Dependency Scope & Target

- `-p, --production` (boolean): 
  Don't install devDependencies

- `--omit` (string): 
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install

- `-g, --global` (boolean): 
  Install globally

### Lockfile & Package.json

- `-y, --yarn` (boolean): 
  Write a <code>yarn.lock</code> file (yarn v1)

- `--no-save` (boolean): 
  Don't update <code>package.json</code> or save a lockfile

- `--save` (boolean), default `true`: 
  Save to <code>package.json</code> (true by default)

- `--frozen-lockfile` (boolean): 
  Disallow changes to lockfile

- `--save-text-lockfile` (boolean): 
  Save a text-based lockfile

- `--lockfile-only` (boolean): 
  Generate a lockfile without installing dependencies

- `--trust` (boolean): 
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the package(s)

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

- `--network-concurrency` (number), default `64`: 
  Maximum number of concurrent network requests (default 64)

### Caching

- `--cache-dir` (string): 
  Store &amp; load cached data from a specific directory path

- `--no-cache` (boolean): 
  Ignore manifest cache entirely

### Execution Behavior

- `--dry-run` (boolean): 
  Has no effect. <code>bun outdated</code> is read-only

- `-f, --force` (boolean): 
  Always request the latest versions from the registry &amp; reinstall all dependencies

- `--no-verify` (boolean): 
  Skip verifying integrity of newly downloaded packages

- `--ignore-scripts` (boolean): 
  Skip lifecycle scripts for all packages, including the project's <code>package.json</code> and trusted dependencies

- `--backend` (string): 
  Platform-specific optimizations for installing dependencies. Possible values: <code>clonefile</code> (default on
  macOS), <code>hardlink</code> (default on Linux and Windows), <code>symlink</code>, <code>copyfile</code>

- `--concurrent-scripts` (number): 
  Maximum number of concurrent jobs for lifecycle scripts (default: 2x CPU cores)
