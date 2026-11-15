---
name: bun-lint-rules-react-gating
description: "Validate the directive that puts a compiled component behind a feature flag. Use when working with Bun: react-hooks/gating (bun docs lint/rules/react/gating.mdx)."
---

# react-hooks/gating

The React Compiler can keep both the compiled and the original version of a component and pick one at run time with a feature flag. With dynamic gating, a function names its flag in a directive, `"use memo if(flagName)"`. This rule is for mistakes in that directive: a flag that isn't a valid identifier, or more than one of these directives in a function.

`bun lint` runs the compiler's checks without dynamic gating, so this rule never reports anything. It exists so a config that turns it on keeps working.

{/* never reports */}

## Examples

Not reported:

{/* good */}
```jsx
function Page() {
  "use memo if(isCompilerOn)";
  return <main>Home</main>;
}
```
