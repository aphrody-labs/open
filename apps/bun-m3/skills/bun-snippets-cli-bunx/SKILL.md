---
name: bun-snippets-cli-bunx
description: "snippets/cli/bunx.mdx. Use when working with Bun: snippets/cli/bunx.mdx (bun docs snippets/cli/bunx.mdx)."
---

# snippets/cli/bunx.mdx

## Usage

```bash
bunx [flags] <package>[@version] [flags and arguments for the package]
```

Execute an npm package executable (CLI). If the package isn't installed in `node_modules`, Bun installs it into a global shared cache.

### Flags

- `--bun` (boolean): 
  Force the command to run with Bun instead of Node.js, even if the executable contains a Node shebang (`#!/usr/bin/env
  node`)

- `-p, --package` (string): 
  Specify package to install when binary name differs from package name

- `--no-install` (boolean): 
  Skip installation if package is not already installed

- `--cwd` (string): 
  Set the working directory

- `--env-file` (string): 
  Load environment variables from the specified file(s)

- `--minimum-release-age` (number): 
  Only install packages published at least N seconds ago (security feature)

- `--use-system-ca` (boolean): 
  Use the system's trusted certificate authorities during installation

- `--use-openssl-ca` (boolean): 
  Use OpenSSL's default CA store instead of the bundled one during installation

- `--use-bundled-ca` (boolean): 
  Use bundled CA store during installation

- `--trust` (boolean): 
  Run the lifecycle scripts of the package and of **all** of its dependencies during installation

- `--verbose` (boolean): 
  Enable verbose output during installation

- `--silent` (boolean): 
  Suppress output during installation

### Examples

```bash terminal icon="terminal"
# Run Prisma migrations
bunx prisma migrate

# Format a file with Prettier
bunx prettier foo.js

# Run a specific version of a package
bunx uglify-js@3.14.0 app.js

# Use --package when binary name differs from package name
bunx -p @angular/cli ng new my-app

# Force running with Bun instead of Node.js, even if the executable contains a Node shebang
bunx --bun vite dev foo.js
```
