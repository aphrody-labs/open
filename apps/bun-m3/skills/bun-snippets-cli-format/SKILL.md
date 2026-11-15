---
name: bun-snippets-cli-format
description: "snippets/cli/format.mdx. Use when working with Bun: snippets/cli/format.mdx (bun docs snippets/cli/format.mdx)."
---

# snippets/cli/format.mdx

# CLI Usage

```bash
bun fmt [flags] [files, directories, or globs]
```

### Modes

- `-c, --check` (boolean): 
  Write nothing. Exit with code 1 if a file needs formatting

- `-l, --list-different` (boolean): 
  Like <code>--check</code>, but print only the file names

- `--stdin-filepath` (string): 
  Format standard input as this file and print the result

- `--init` (boolean): 
  Add a <code>[fmt]</code> section to <code>bunfig.toml</code>

- `--doctor` (boolean): 
  Show what Bun does with your Prettier or oxfmt config, and which packages you can remove

- `--no-script` (boolean): 
  Run the formatter even if the project has a <code>fmt</code> script

### Files

- `--staged` (boolean): 
  Format only the files staged in Git, and stage them again

- `--changed` (string): 
  Format only the files that differ from a Git ref. Defaults to the default branch

- `--ignore-pattern` (string): 
  Skip files that match this glob. Can be repeated

### Options

- `--print-width` (number), default `80`: 
  Wrap lines at this column

- `--tab-width` (number), default `2`: 
  Spaces per indentation level

- `--use-tabs` (boolean): 
  Indent with tabs

- `--no-semi` (boolean): 
  Only print semicolons where they are needed

- `--single-quote` (boolean): 
  Use single quotes

- `--trailing-comma` (string), default `all`: 
  <code>all</code>, <code>es5</code>, or <code>none</code>

- `--sort-imports` (boolean): 
  Sort and group imports

- `--sort-tailwindcss` (boolean): 
  Sort Tailwind CSS classes

- `--sort-package-json` (boolean): 
  Sort the keys of <code>package.json</code>

- `--jsdoc` (boolean): 
  Format JSDoc comments

- `--svelte` (boolean): 
  Format Svelte components. This is the default without a Prettier or oxfmt config

- `--no-svelte` (boolean): 
  Do not format Svelte components

- `--no-editorconfig` (boolean): 
  Do not read <code>.editorconfig</code>

All of [Prettier's options](https://prettier.io/docs/options) are flags too.

### Output

- `--log-level` (string), default `log`: 
  <code>silent</code>, <code>error</code>, <code>warn</code>, <code>log</code>, or <code>debug</code>

- `--threads` (number): 
  Number of threads. Defaults to one per CPU core

`bun fmt` also accepts the flags of Prettier and oxfmt. Run `bun fmt --help --all` to see them.
