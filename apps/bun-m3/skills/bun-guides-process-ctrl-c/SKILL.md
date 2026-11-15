---
name: bun-guides-process-ctrl-c
description: "Listen for CTRL+C. Use when working with Bun: Listen for CTRL+C (bun docs guides/process/ctrl-c.mdx)."
---

# Listen for CTRL+C

The `ctrl+c` shortcut sends an _interrupt signal_ to the running process. Intercept it by listening for the `SIGINT` event. To close the process, you must explicitly call `process.exit()`.

```ts process.ts icon="/icons/typescript.svg"
process.on("SIGINT", () => {
  console.log("Ctrl-C was pressed");
  process.exit();
});
```

---

See [Utils](/runtime/utils) for more utilities.
