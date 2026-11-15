---
name: bun-snippets-cli-install
description: "snippets/cli/install.mdx. Use when working with Bun: snippets/cli/install.mdx (bun docs snippets/cli/install.mdx)."
---

# snippets/cli/install.mdx

## CLI Usage

```sh terminal icon="terminal"
bun install <name>@<version>
```

### General Configuration

- `--config` (string): 
  Specify path to config file (bunfig.toml)

- `--cwd` (string): 
  Set a specific cwd

- `--env-file` (string): 
  Load environment variables from the specified file(s)

- `--no-env-file` (boolean): 
  Disable automatic loading of .env files

### Dependency Scope & Management

- `--production` (boolean): 
  Don't install devDependencies

- `--no-save` (boolean): 
  Don't update package.json or save a lockfile

- `--save` (boolean), default `true`: 
  Save to package.json

- `--omit` (string): 
  Exclude 'dev', 'optional', or 'peer' dependencies from install

- `--only-missing` (boolean): 
  Only add dependencies to package.json if they are not already present

### Dependency Type & Versioning

- `--dev` (boolean): 
  Add dependency to "devDependencies"

- `--optional` (boolean): 
  Add dependency to "optionalDependencies"

- `--peer` (boolean): 
  Add dependency to "peerDependencies"

- `--save-prod` (boolean): 
  Add dependency to "dependencies", also when another group lists it

- `--exact` (boolean): 
  Add the exact version instead of the ^ range

### Lockfile Control

- `--yarn` (boolean): 
  Write a yarn.lock file (yarn v1)

- `--frozen-lockfile` (boolean): 
  Disallow changes to lockfile

- `--save-text-lockfile` (boolean): 
  Save a text-based lockfile

- `--lockfile-only` (boolean): 
  Generate a lockfile without installing dependencies

### Network & Registry Settings

- `--ca` (string): 
  Provide a Certificate Authority signing certificate

- `--cafile` (string): 
  File path to Certificate Authority signing certificate

- `--use-system-ca` (boolean): 
  Use the system's trusted certificate authorities

- `--use-openssl-ca` (boolean): 
  Use OpenSSL's default CA store instead of the bundled one

- `--use-bundled-ca` (boolean): 
  Use bundled CA store

- `--registry` (string): 
  Use a specific registry by default, overriding .npmrc, bunfig.toml and environment variables

### Installation Process Control

- `--dry-run` (boolean): 
  Resolve dependencies but don't install packages, update package.json, save a lockfile, or run the project's lifecycle
  scripts

- `--force` (boolean): 
  Always request the latest versions from the registry & reinstall all dependencies

- `--global` (boolean): 
  Install globally

- `--backend` (string): 
  Platform-specific optimizations: "clonefile", "hardlink", "symlink", "copyfile"

- `--filter` (string): 
  Install packages for the matching workspaces

- `--analyze` (boolean): 
  Recursively analyze & install all dependencies of files passed as arguments

### Caching Options

- `--cache-dir` (string): 
  Store & load cached data from a specific directory path

- `--no-cache` (boolean): 
  Ignore manifest cache entirely

### Output & Logging

- `--silent` (boolean): 
  Don't log anything

- `--verbose` (boolean): 
  Excessively verbose logging

- `--no-progress` (boolean): 
  Disable the progress bar

- `--no-summary` (boolean): 
  Don't print a summary

### Security & Integrity

- `--no-verify` (boolean): 
  Skip verifying integrity of newly downloaded packages

- `--trust` (boolean): 
  Add to trustedDependencies in the project's package.json and install the package(s)

### Concurrency & Performance

- `--concurrent-scripts` (number): 
  Maximum number of concurrent jobs for lifecycle scripts (default: 2x CPU cores)

- `--network-concurrency` (number), default `64`: 
  Maximum number of concurrent network requests

### Lifecycle Script Management

- `--ignore-scripts` (boolean): 
  Skip lifecycle scripts for all packages, including the project's package.json and trusted dependencies. Also set by
  <code>NPM_CONFIG_IGNORE_SCRIPTS=true</code> in the environment

### Help Information

- `--help` (boolean): 
  Print this help menu
