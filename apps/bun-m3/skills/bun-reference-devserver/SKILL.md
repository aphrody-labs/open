---
name: bun-reference-devserver
description: "Bun API reference from bun-types devserver.d.ts: 6 documented declarations with examples (hot, data, accept, accept, accept, prune)."
---

# devserver

## `hot`

Hot module replacement (HMR) APIs. In production this value is
`undefined`, so you can guard HMR code with an `if` statement:



The check is usually unnecessary: Bun dead-code-eliminates calls to the
HMR APIs in production builds.

https://bun.com/docs/bundler/hmr

```ts
if (import.meta.hot) {
  // HMR APIs are available
}
```

## `data`

Persists state across module instances during hot replacement, so the
previous version of a module can pass data to the next one. Writing to
`import.meta.hot.data` marks the module as self-accepting (equivalent
to calling `accept()`).




In production, `data` is inlined to `{}`, which lets Bun minify
`{}.prop ??= value` to `value`.

```ts
const root = import.meta.hot.data.root ??= createRoot(elem);
root.render(<App />); // re-use an existing root
```

## `accept`

Indicate that this module can be replaced by re-evaluating the file.
After a hot update, Bun patches importers of this module automatically.

When `import.meta.hot.accept` is not used, the page reloads when the
file updates, and a console message shows which files were checked.

```ts
import { getCount } from "./foo";

console.log("count is ", getCount());

import.meta.hot.accept();
```

## `accept`

Indicate that this module can be replaced by evaluating the new module
and then calling the callback with it. In this mode, importers are not
patched. This matches Vite, which cannot patch import statements.
Prefer `import.meta.hot.accept()` without an argument; it usually makes
your code easier to understand.

When `import.meta.hot.accept` is not used, the page reloads when the
file updates, and a console message shows which files were checked.




In production, calls to this are dead-code-eliminated.

```ts
export const count = 0;

import.meta.hot.accept((newModule) => {
  if (newModule) {
    // newModule is undefined when SyntaxError happened
    console.log('updated: count is now ', newModule.count)
  }
});
```

## `accept`

Indicate that a dependency's module can be accepted. When the
dependency updates, Bun calls the callback with the new module.

When `import.meta.hot.accept` is not used, the page reloads when the
file updates, and a console message shows which files were checked.

```ts
import.meta.hot.accept('./foo', (newModule) => {
  if (newModule) {
    // newModule is undefined when SyntaxError happened
    console.log('updated: count is now ', newModule.count)
  }
});
```

## `prune`

//  * Attach a callback that is called when the module is removed from the module graph.
    //  *
    //  * This can be used to clean up resources that were created when the module was loaded.
    //  * Unlike `import.meta.hot.dispose()`, this pairs much better with `accept` and `data` to manage stateful resources.
    //  *
    //  * @example
    //  * 
    //

```ts
    //  * export const ws = (import.meta.hot.data.ws ??= new WebSocket(location.origin));
    //  *
    //  * import.meta.hot.prune(() => {
    //  *   ws.close();
    //  * });
    //  *
```

