---
name: bun-snippets-cli-init
description: "snippets/cli/init.mdx. Use when working with Bun: snippets/cli/init.mdx (bun docs snippets/cli/init.mdx)."
---

# snippets/cli/init.mdx

## CLI Usage

```bash terminal icon="terminal"
bun init <folder?>
```

### Initialization Options

- `--yes` (boolean): 
  {" "}
  Accept all default prompts without asking questions. Alias: <code>-y</code>{" "}

- `--minimal` (boolean): 
  {" "}
  Only initialize type definitions (skip app scaffolding). Alias: <code>-m</code>{" "}

### Project Templates

- `--react` (string|boolean): 
  {" "}
  Scaffold a React project. When used without a value, creates a baseline React app.
  <br /> Accepts values for presets:{" "}
  <ul>
    {" "}
    <li>
      <code>tailwind</code> – React app preconfigured with Tailwind CSS
    </li>{" "}
    <li>
      <code>shadcn</code> – React app with <code>@shadcn/ui</code> and Tailwind CSS
    </li>{" "}
  </ul>{" "}
  Examples:{" "}
  <pre>
    <code>
      bun init --react{"\n"}bun init --react=tailwind{"\n"}bun init --react=shadcn
    </code>
  </pre>{" "}

### Output & Files

- `(result)` (info): 
  {" "}
  Initializes project files and configuration for the chosen options. Exact files vary by template.{" "}

### Help

- `--help` (boolean): 
  {" "}
  Print this help menu. Alias: <code>-h</code>{" "}

### Examples

- Accept all defaults

  ```bash terminal icon="terminal"
  bun init -y
  ```

- React

  ```bash terminal icon="terminal"
  bun init --react
  ```

- React + Tailwind CSS

  ```bash terminal icon="terminal"
  bun init --react=tailwind
  ```

- React + @shadcn/ui
  ```bash terminal icon="terminal"
  bun init --react=shadcn
  ```
