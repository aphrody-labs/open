---
name: bun-guides-test-mock-clock
description: "Set the system time in Bun's test runner. Use when working with Bun: Set the system time in Bun's test runner (bun docs guides/test/mock-clock.mdx)."
---

# Set the system time in Bun's test runner

Set the system time in tests with the `setSystemTime` function from `bun:test`.

```ts

test("party like it's 1999", () => {
  const date = new Date("1999-01-01T00:00:00.000Z");
  setSystemTime(date); // it's now January 1, 1999

  const now = new Date();
  expect(now.getFullYear()).toBe(1999);
  expect(now.getMonth()).toBe(0);
  expect(now.getDate()).toBe(1);
});
```

---

Call `setSystemTime` in a [lifecycle hook](/test/lifecycle) like `beforeAll` to give your tests a deterministic "fake clock".

```ts

beforeAll(() => {
  const date = new Date("1999-01-01T00:00:00.000Z");
  setSystemTime(date); // it's now January 1, 1999
});

// tests...
```

---

To reset the system clock to the actual time, call `setSystemTime` with no arguments.

```ts

setSystemTime(); // reset to actual time
```

---

See [Dates and times](/test/dates-times).
