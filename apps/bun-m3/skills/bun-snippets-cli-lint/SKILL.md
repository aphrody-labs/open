---
name: bun-snippets-cli-lint
description: "snippets/cli/lint.mdx. Use when working with Bun: snippets/cli/lint.mdx (bun docs snippets/cli/lint.mdx)."
---

# snippets/cli/lint.mdx

# CLI Usage

```bash
bun lint [flags] [files, directories, or globs]
```

### Rules

- `--rule` (string): 
  Set a rule for this run: <code>--rule 'eqeqeq: [error, smart]'</code>. Turn off a plugin:{" "}
  <code>--rule 'unicorn/*: off'</code>

- `--type-aware` (boolean): 
  Also run the rules that need type information

- `--rules` (boolean): 
  List every built-in rule. Add <code>-f json</code> for machine-readable output

- `--explain` (string): 
  Print the documentation for a rule

- `--init` (boolean): 
  Add a <code>[lint]</code> section to <code>bunfig.toml</code>

### Fixing

- `--fix` (boolean): 
  Apply fixes and write the files

- `--fix-suggestions` (boolean): 
  Also apply suggestions, which may change what the code does

- `--fix-dry-run` (boolean): 
  Compute fixes without writing them. The <code>json</code> format includes the fixed code

### Files

- `--staged` (boolean): 
  Lint only the files staged in Git

- `--changed` (string): 
  Lint only the files that differ from a Git ref. Defaults to the default branch

- `--ignore-pattern` (string): 
  Skip files that match this glob. Can be repeated

- `--no-ignore` (boolean): 
  Lint ignored files too

### Output

- `-f, --format` (string), default `pretty`: 
  <code>pretty</code>, <code>stylish</code>, <code>json</code>, <code>unix</code>, <code>github</code>,{" "}
  <code>junit</code>, <code>checkstyle</code>, <code>gitlab</code>, <code>sarif</code>, or <code>agent</code>

- `-o, --output-file` (string): 
  Write the report to a file

- `--quiet` (boolean): 
  Report errors only

- `--max-warnings` (number): 
  Exit with code 1 if there are more warnings than this

- `--all` (boolean): 
  Show every problem. By default, more than 50 identical problems are grouped

### Tools

- `--doctor` (boolean): 
  Show which rules of your ESLint or oxlint config run natively, and which packages you can remove

- `--print-config` (string): 
  Print the resolved config for a file

- `--no-script` (boolean): 
  Run the linter even if the project has a <code>lint</code> script

`bun lint` also accepts the flags of ESLint and oxlint. Run `bun lint --help --all` to see them.
