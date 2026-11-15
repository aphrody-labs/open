---
name: bun-snippets-cli-patch
description: "snippets/cli/patch.mdx. Use when working with Bun: snippets/cli/patch.mdx (bun docs snippets/cli/patch.mdx)."
---

# snippets/cli/patch.mdx

# CLI Usage

```bash
bun patch <package>@<version>
```

### Patch Generation

- `--commit` (boolean): 
  Install a package containing modifications in <code>dir</code>

- `--patches-dir` (string): 
  The directory to put the patch file in (only if --commit is used)

### Dependency Management

- `--production` (boolean): 
  Don't install devDependencies. Alias: <code>-p</code>

- `--ignore-scripts` (boolean): 
  Skip lifecycle scripts for all packages, including the project's <code>package.json</code> and trusted dependencies

- `--trust` (boolean): 
  Add to <code>trustedDependencies</code> in the project's <code>package.json</code> and install the package(s)

- `--global` (boolean): 
  Install globally. Alias: <code>-g</code>

- `--omit` (string): 
  Exclude <code>dev</code>, <code>optional</code>, or <code>peer</code> dependencies from install

### Project Files &amp; Lockfiles

- `--yarn` (boolean): 
  Write a <code>yarn.lock</code> file (yarn v1). Alias: <code>-y</code>

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

### Installation Control

- `--backend` (string): 
  Platform-specific optimizations for installing dependencies. Possible values: <code>clonefile</code> (default on
  macOS), <code>hardlink</code> (default on Linux and Windows), <code>symlink</code>, <code>copyfile</code>

- `--linker` (string): 
  Linker strategy (one of <code>isolated</code> or <code>hoisted</code>)

- `--minimum-release-age` (number): 
  Only install packages published at least N seconds ago (security feature)

- `--minimum-release-age-excludes` (string): 
  Packages exempt from <code>--minimum-release-age</code> (comma-separated or repeated; replaces the bunfig.toml list)

- `--dry-run` (boolean): 
  Print what the command would do, with or without <code>--commit</code>, and leave the project as it is

- `--force` (boolean): 
  Always request the latest versions from the registry &amp; reinstall all dependencies. Alias: <code>-f</code>

- `--no-verify` (boolean): 
  Skip verifying integrity of newly downloaded packages

### Network &amp; Registry

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
  Maximum number of concurrent network requests (default 64)

### Performance &amp; Resource

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

- `--quiet` (boolean): 
  Disable the progress bar

- `--verbose` (boolean): 
  Excessively verbose logging

- `--no-progress` (boolean): 
  Disable the progress bar

- `--no-summary` (boolean): 
  Don't print a summary

### Platform Targeting

- `--cpu` (string): 
  Override CPU architecture for optional dependencies (e.g., <code>x64</code>, <code>arm64</code>, <code>*</code> for
  all)

- `--os` (string): 
  Override operating system for optional dependencies (e.g., <code>linux</code>, <code>darwin</code>, <code>*</code> for
  all)

- `--libc` (string): 
  Override libc for optional dependencies (e.g., <code>glibc</code>, <code>musl</code>, <code>*</code> for all)

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
