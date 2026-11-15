---
name: bun-reference-bundle
description: "Bun API reference from bun-types bundle.d.ts: 3 documented declarations with examples (bun, Registry, feature)."
---

# bundle

## `bun`

The `bun:bundle` module provides compile-time utilities for dead-code elimination.




Enable feature flags from the CLI:

```ts
import { feature } from "bun:bundle";

if (feature("SUPER_SECRET")) {
  console.log("Secret feature enabled!");
} else {
  console.log("Normal mode");
}
```

```bash
# During build
bun build --feature=SUPER_SECRET index.ts

# At runtime
bun run --feature=SUPER_SECRET index.ts

# In tests
bun test --feature=SUPER_SECRET
```

## `Registry`

Registry for type-safe feature flags.

Augment this interface to get autocomplete and type checking for your feature flags:




Now `feature()` only accepts `"DEBUG"`, `"PREMIUM"`, or `"BETA"`:

```ts
// env.d.ts
declare module "bun:bundle" {
  interface Registry {
    features: "DEBUG" | "PREMIUM" | "BETA";
  }
}
```

```ts
feature("DEBUG");    // OK
feature("TYPO");     // Type error
```

## `feature`

Checks whether a feature flag is enabled at compile time.

At bundle time, Bun replaces each call with a boolean literal (`true` or `false`)
and removes the unreachable branch.

```ts
import { feature } from "bun:bundle";

// With --feature=DEBUG, this becomes: if (true) { ... }
// Without --feature=DEBUG, this becomes: if (false) { ... }
if (feature("DEBUG")) {
  console.log("Debug mode enabled");
}
```

