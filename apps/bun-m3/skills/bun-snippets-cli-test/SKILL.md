---
name: bun-snippets-cli-test
description: "snippets/cli/test.mdx. Use when working with Bun: snippets/cli/test.mdx (bun docs snippets/cli/test.mdx)."
---

# snippets/cli/test.mdx

# CLI Usage

```bash
bun test <patterns>
```

### Execution Control

- `--check` (boolean): 
  Type check the test files and everything they import. No test runs if there are type errors

- `--aot` (boolean): 
  Compile the test files ahead of time, then run them. See{" "}
  <a href="/compiler/debugging#run-your-tests-compiled">Run your tests compiled</a>

- `--timeout` (number), default `5000`: 
  Set the per-test timeout in milliseconds (default 5000)

- `--rerun-each` (number): 
  Re-run each test file <code>NUMBER</code> times to help catch certain bugs

- `--retry` (number): 
  Retry failed tests up to <code>NUMBER</code> times. Per-test <code>{`{ retry: N }`}</code> overrides this flag

- `--concurrent` (boolean): 
  Treat all tests as <code>test.concurrent()</code> tests

- `--randomize` (boolean): 
  Run tests in random order

- `--seed` (number): 
  Set the random seed for test randomization

- `--bail` (number): 
  Exit the test suite after <code>NUMBER</code> failures. If you do not specify a number, it defaults to 1.

- `--max-concurrency` (number), default `20`: 
  Maximum number of concurrent tests to execute at once (default 20)

- `--environment` (string), default `node`: 
  The DOM that test files run with: <code>node</code> (no DOM), <code>jsdom</code> or <code>happy-dom</code>. A{" "}
  <code>@vitest-environment</code> or <code>@jest-environment</code> comment in a file overrides it

- `--globals` (string), default `bun`: 
  Where <code>test</code>, <code>expect</code> and the other globals come from. With <code>bun</code>, a file that
  imports from <code>"vitest"</code> gets them from there and any other file gets them from <code>"bun:test"</code>.
  With <code>vitest</code>, every file gets them from <code>"vitest"</code>

- `--react-compiler` (boolean): 
  Compile components and hooks with the React Compiler. Test files, preload scripts and <code>node_modules</code> are
  left alone

### Test Filtering

- `--todo` (boolean): 
  Include tests that are marked with <code>test.todo()</code>

- `--test-name-pattern` (string): 
  Run only tests with a name that matches the given regex. Alias: <code>-t</code>

### Reporting

- `--reporter` (string): 
  Test output reporter format. Available: <code>junit</code> (requires --reporter-outfile), <code>dots</code>. Default:
  console output.

- `--reporter-outfile` (string): 
  Output file path for the reporter format (required with --reporter=junit)

- `--reporter-junit-suites` (string): 
  How --reporter=junit writes describe blocks. <code>nested</code> (the default) gives each block its own testsuite
  inside the file's testsuite. <code>flat</code> prefixes each test's name with its block names

- `--dots` (boolean): 
  Enable dots reporter. Shorthand for --reporter=dots

### Coverage

- `--coverage` (boolean): 
  Generate a coverage profile

- `--coverage-reporter` (string), default `text`: 
  Report coverage in <code>text</code> and/or <code>lcov</code>. Defaults to <code>text</code>. Implies{" "}
  <code>--coverage</code>

- `--coverage-dir` (string), default `coverage`: 
  Directory for coverage files. Defaults to <code>coverage</code>

### Snapshots

- `--update-snapshots` (boolean): 
  Update snapshot files. Alias: <code>-u</code>

## Examples

Run all test files:

```bash terminal icon="terminal"
bun test
```

Run all test files with "foo" or "bar" in the file name:

```bash terminal icon="terminal"
bun test foo bar
```

Run all test files, only including tests whose name includes "baz":

```bash terminal icon="terminal"
bun test --test-name-pattern baz
```
