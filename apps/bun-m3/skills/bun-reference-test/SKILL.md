---
name: bun-reference-test
description: "Bun API reference from bun-types test.d.ts: 26 documented declarations with examples (bun, ModuleMockFactory, module, setSystemTime, spyOn, mockObject, ...)."
---

# test

## `bun`

To run tests, run `bun test`

```bash
$ bun test
```

```bash
$ bun test <filename>
```

## `ModuleMockFactory`

Returns a mocked module's exports, or a promise for them. Call `importOriginal()` to load the real module.

```ts
vi.mock("./math", async importOriginal => ({ ...(await importOriginal()), add: vi.fn() }));
```

## `module`

Replace the module `id` with the return value of `factory`.

If the module is already loaded, exports are overwritten with the return
value of `factory`. If an export didn't exist before, it is not added to
existing import statements. This is a consequence of how ESM works.

If the module is already loaded and `factory` returns a promise that is
still pending, the exports are overwritten once it settles and the
returned promise resolves after that. Otherwise nothing is returned.



that loads the real module.

```ts
import { mock } from "bun:test";

mock.module("fs/promises", () => {
 return {
   readFile: () => Promise.resolve("hello world"),
 };
});

import { readFile } from "fs/promises";

console.log(await readFile("hello.txt", "utf8")); // hello world
```

## `setSystemTime`

Control the system time used by:
- `Date.now()`
- `new Date()`
- `Intl.DateTimeFormat().format()`

The real time is restored when the test file ends, unless a preload set the time.




## Set Date to a specific time


## Reset Date to the current time

```js
import { setSystemTime } from 'bun:test';

setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
console.log(new Date().toISOString()); // 2020-01-01T00:00:00.000Z
```

```js
import { setSystemTime } from 'bun:test';

setSystemTime();
```

## `spyOn`

Create a spy on a property's getter. The spy calls the original getter until you give it another implementation.

```ts
spyOn(navigator, "userAgent", "get").mockReturnValue("test");
```

## `mockObject`

Deeply mock `value`, the same way `vi.mock()` mocks a module when it has no factory. Returns a copy where
functions and classes are mocks that return `undefined` and arrays are empty. Primitives and builtin objects are
kept.

With `{ spy: true }`, functions keep their implementation, arrays keep their elements, and objects are modified
in place instead of copied.

```ts
const mocked = vi.mockObject({ add: (a: number, b: number) => a + b });
mocked.add(1, 2); // undefined
mocked.add.mockReturnValue(3);
```

## `mock`

Replace a module with the return value of `factory`. The call is hoisted above the file's imports.

Without a factory, the module is replaced with the file of the same name in a `__mocks__` directory. If there
isn't one, it's replaced with a copy of the module where every function is a mock. With `{ spy: true }`, the
functions keep their implementation.

```ts
import { add } from "./math";

vi.mock("./math", async importOriginal => ({ ...(await importOriginal()), add: vi.fn(() => 3) }));
```

## `hoisted`

Calls `factory` and returns its result. The statement is hoisted above the file's imports, so a `vi.mock`
factory can use the result.

```ts
const mocks = vi.hoisted(() => ({ add: vi.fn() }));
vi.mock("./math", () => ({ add: mocks.add }));
```

## `waitFor`

Call `callback` right away, then every `interval` milliseconds, until it doesn't throw or reject. Resolves with
its value. After `timeout` milliseconds, rejects with its last error.

The wait uses the real clock. While fake timers are on, `vi.advanceTimersByTime(interval)` runs before each call.

```ts
await vi.waitFor(() => expect(server.isReady).toBe(true), { timeout: 500 });
```

## `waitUntil`

Call `callback` right away, then every `interval` milliseconds, until it returns a truthy value. Resolves with
that value. Rejects right away if `callback` throws or rejects, and with a timeout error after `timeout`
milliseconds.

The wait uses the real clock. While fake timers are on, `vi.advanceTimersByTime(interval)` runs before each call.

```ts
const element = await vi.waitUntil(() => document.querySelector(".element"));
```

## `Describe`

Describes a group of related tests.

```ts
function sum(a, b) {
  return a + b;
}
describe("sum()", () => {
  test("can sum two values", () => {
    expect(sum(1, 1)).toBe(2);
  });
});
```

## `describe`

Describes a group of related tests.

```ts
function sum(a, b) {
  return a + b;
}
describe("sum()", () => {
  test("can sum two values", () => {
    expect(sum(1, 1)).toBe(2);
  });
});
```

## `beforeAll`

Runs a function, once, before all the tests.

Use this for setup, like initializing a global variable or
connecting to a database.

If the function throws, no tests in the file run.

```ts
let database;
beforeAll(async () => {
  database = await connect("localhost");
});
```

## `afterAll`

Runs a function, once, after all the tests.

Use this for cleanup, like closing a socket or
deleting temporary files.

```ts
let database;
afterAll(async () => {
  if (database) {
    await database.close();
  }
});
```

## `aroundEach`

Wraps each test in a function. The function does its setup, awaits `runTest()`, then does its teardown.

`runTest()` runs the `beforeEach` hooks, the test, the `afterEach` hooks and the `onTestFinished()` callbacks.
They run in the async context `runTest()` is called in, so they see the store of an `AsyncLocalStorage`
whose `run()` calls it. The promise it returns resolves even if the test fails.

- The first hook registered is the outermost one, and the hooks of an outer `describe()` block go around those of an inner one.
- The hook runs again for each retry and each repeat. It doesn't run for a skipped or todo test.
- The test fails if the hook throws, or if it finishes without calling `runTest()`. A second `runTest()` call rejects.
- The timeout applies to the time before `runTest()` is called, and again to the time after its promise resolves.
  The time in between isn't counted.

```ts
aroundEach(async runTest => {
  await database.transaction(runTest);
});
```

## `aroundAll`

Wraps all the tests of the file or `describe()` block in a function. The function does its setup, awaits
`runSuite()`, then does its teardown.

`runSuite()` runs the block's `beforeAll` hooks, its tests and nested blocks, and its `afterAll` hooks, in the
async context `runSuite()` is called in. If the hook fails before it calls `runSuite()`, none of them run.

Nesting, failures and the timeout work as in {@link aroundEach}. The hook doesn't run if every test in the block is skipped.

```ts
aroundAll(async runSuite => {
  await tracer.trace("suite", runSuite);
});
```

## `onTestFinished`

Runs a function after the test finishes, once all `afterEach` hooks have completed.

Can only be called inside a test, not in `describe` blocks.

```ts
test("my test", () => {
  onTestFinished(() => {
    // This runs after all afterEach hooks
    console.log("Test finished!");
  });
});
```

## `timeout`

Sets the timeout for the test in milliseconds.

If the test does not complete within this time, it fails with:

```ts
'Timeout: test {name} timed out after 5000ms'
```

## `Test`

Runs a test.

```ts
test("can check if using Bun", () => {
  expect(Bun).toBeDefined();
});

test("can make a fetch() request", async () => {
  const response = await fetch("https://example.com/");
  expect(response.ok).toBe(true);
});

test("can set a timeout", async () => {
  await Bun.sleep(100);
}, 50); // or { timeout: 50 }
```

## `(`

Runs a test, with the options before the test function.

```ts
test("can retry", { retry: 3 }, () => {
  expect(Math.random()).toBeLessThan(0.5);
});
```

## `each`

Takes the table as a tagged template. The first line names the columns, and each row is passed as an object.

```ts
test.each`
  a    | b    | sum
  ${1} | ${2} | ${3}
`("$a + $b = $sum", ({ a, b, sum }) => {
  expect(a + b).toBe(sum);
});
```

## `for`

Like `each()`, but an array row is passed as one argument instead of being spread,
and the second argument is the {@link TestContext}.

```ts
test.for([[1, 2, 3]])("%i + %i = %i", ([a, b, sum], { expect }) => {
  expect(a + b).toBe(sum);
});
```

## `extend`

Returns a `test` whose callbacks receive the {@link TestContext} with `fixtures` added to it.

A fixture is set up for the tests that destructure it, and for the returned `test`'s
`beforeEach()` / `afterEach()` hooks that destructure it. It's torn down after the test.

```ts
const test = base.extend<{ server: Server }>({
  server: async ({}, use) => {
    const server = Bun.serve({ port: 0, fetch: () => new Response("ok") });
    await use(server);
    await server.stop();
  },
});

test("responds", async ({ server }) => {
  expect(await (await fetch(server.url)).text()).toBe("ok");
});
```

## `test`

Runs a test.

```ts
test("can check if using Bun", () => {
  expect(Bun).toBeDefined();
});

test("can make a fetch() request", async () => {
  const response = await fetch("https://example.com/");
  expect(response.ok).toBe(true);
});
```

## `expect`

Asserts that a value matches some criteria.

```ts
expect(1 + 1).toBe(2);
expect([1,2,3]).toContain(2);
expect(null).toBeNull();
```

## `unreachable`

Throws an error if called.

```ts
import { expect, test } from "bun:test";

test("!!abc!! is not a module", () => {
 try {
    require("!!abc!!");
    expect.unreachable();
 } catch(e) {
    expect(e.name).not.toBe("UnreachableError");
 }
});
```

