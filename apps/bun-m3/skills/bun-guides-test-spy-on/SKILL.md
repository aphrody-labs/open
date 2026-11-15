---
name: bun-guides-test-spy-on
description: "Spy on methods in `bun test`. Use when working with Bun: Spy on methods in `bun test` (bun docs guides/test/spy-on.mdx)."
---

# Spy on methods in `bun test`

Use the `spyOn` utility to track method calls with Bun's test runner.

```ts

const leo = {
  name: "Leonardo",
  sayHi(thing: string) {
    console.log(`Sup I'm ${this.name} and I like ${thing}`);
  },
};

const spy = spyOn(leo, "sayHi");
```

---

Once you've created the spy, use it in `expect` assertions about method calls.

{/* prettier-ignore */}
```ts

const leo = {
  name: "Leonardo",
  sayHi(thing: string) {
    console.log(`Sup I'm ${this.name} and I like ${thing}`);
  },
};

const spy = spyOn(leo, "sayHi");

test("turtles", () => { // [!code ++]
  expect(spy).toHaveBeenCalledTimes(0); // [!code ++]
  leo.sayHi("pizza"); // [!code ++]
  expect(spy).toHaveBeenCalledTimes(1); // [!code ++]
  expect(spy.mock.calls).toEqual([["pizza"]]); // [!code ++]
}); // [!code ++]
```

---

See [Mocks](/test/mocks).
