---
name: bun-lint-rules-react-memoized-effect-dependencies
description: "Require the dependencies of an effect to be memoized. Use when working with Bun: react-hooks/memoized-effect-dependencies (bun docs lint/rules/react/memoized-effect-dependencies.mdx)."
---

# react-hooks/memoized-effect-dependencies

An object or function that's created during render is new every time, so an effect that depends on it runs after every render. React Compiler has a check for that.

`bun lint` doesn't run that check, so this rule reports nothing. It exists because `eslint-plugin-react-hooks` has a rule with this name, and a config that names it needs to keep working.

{/* never reports */}

## Examples

Not reported:

{/* good */}
```jsx

function Chat({ roomId }) {
  const options = { roomId };
  useEffect(() => {
    connect(options);
  }, [options]);
}
```
