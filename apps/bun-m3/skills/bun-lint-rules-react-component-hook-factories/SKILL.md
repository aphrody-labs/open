---
name: bun-lint-rules-react-component-hook-factories
description: "Deprecated: reports nothing, and is kept so that older configs still load. Use when working with Bun: react-hooks/component-hook-factories (bun docs lint/rules/react/component-hook-factories.mdx)."
---

# react-hooks/component-hook-factories

This rule reports nothing. It was about functions that create a component or a hook each time they're called, and `eslint-plugin-react-hooks` removed the check in version 7.1.0 but kept the name. `bun lint` does the same, so a config that still mentions the rule keeps working.

You can delete it from your config.

{/* never reports */}

## Examples

Not reported:

{/* good */}
```jsx
function makeButton(color) {
  return function Button({ children }) {
    return <button type="button" style={{ color }}>{children}</button>;
  };
}
```
