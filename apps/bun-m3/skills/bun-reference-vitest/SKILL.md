---
name: bun-reference-vitest
description: "Bun API reference from bun-types vitest.d.ts: 10 documented declarations with examples (spyOn, Matchers, resolves, rejects, poll, extend, ...)."
---

# vitest

## `spyOn`

Replaces a method, getter or setter on `object` with a mock that still calls the original.

```ts
const log = vi.spyOn(console, "log").mockImplementation(() => {});
```

## `Matchers`

Declare your custom matchers here. They're then typed on `expect()`, `.not`, `.resolves` and `.rejects`, and as
asymmetric matchers such as `expect.toBeWithinRange()`.


`expect.poll()`.

```ts
declare module "vitest" {
  interface Matchers<R, T> {
    toBeWithinRange(floor: number, ceiling: number): R;
  }
}
```

## `resolves`

Expects a promise that resolves, or a function that returns one. The next matcher checks the resolved value and
returns a promise.

```ts
await expect(Promise.resolve(1)).resolves.toBe(1);
```

## `rejects`

Expects a promise that rejects, or a function that returns one. The next matcher checks the rejection reason and
returns a promise.

```ts
await expect(Promise.reject(new Error("no"))).rejects.toThrow("no");
```

## `poll`

Calls `fn`, awaits its result and runs the matcher on it. Retries until the matcher passes. The matcher returns a
promise that rejects with the last failure once `timeout` is up.

The wait uses the real clock, even with fake timers on. Each attempt advances the fake timers by `interval`.

```ts
await expect.poll(() => queue.length, { interval: 10, timeout: 500 }).toBe(0);
```

## `extend`

Registers custom matchers. Declare their types in {@link Matchers}.

```ts
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    return { pass: received >= floor && received <= ceiling, message: () => `${received} is out of range` };
  },
});
```

## `expect`

Wraps a value so you can check it with a matcher.

```ts
expect(1 + 1).toBe(2);
```

## `for`

Like `each()`, but an array row is passed as one argument instead of being spread, and the second argument is the
{@link TestContext}.

```ts
test.for([[1, 2, 3]])("%i + %i = %i", ([a, b, sum], { expect }) => {
  expect(a + b).toBe(sum);
});
```

## `extend`

Returns a `test` whose callbacks receive `fixtures` on the {@link TestContext}.

A fixture is set up for the tests and hooks that destructure it, and torn down after the test.

```ts
const test = base.extend<{ server: Server }>({
  server: async ({}, use) => {
    const server = Bun.serve({ port: 0, fetch: () => new Response("ok") });
    await use(server);
    await server.stop();
  },
});
```

## `test`

Runs a test. The callback receives the {@link TestContext}. Without a callback, the test is marked as todo.

```ts
test("adds", ({ expect }) => {
  expect(1 + 1).toBe(2);
});
```

