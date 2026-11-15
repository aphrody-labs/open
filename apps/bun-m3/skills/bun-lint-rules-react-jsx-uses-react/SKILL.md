---
name: bun-lint-rules-react-jsx-uses-react
description: "Count `React` as used in files that contain JSX. Use when working with Bun: react/jsx-uses-react (bun docs lint/rules/react/jsx-uses-react.mdx)."
---

# react/jsx-uses-react

With the classic JSX transform, `<div />` compiles to `React.createElement("div")`. The file needs `React` in scope, but the name appears nowhere in the code, so `no-unused-vars` reports the import.

This rule reports nothing itself. While it's on, every JSX element counts as a use of `React`, and `no-unused-vars` leaves the import alone.

If a `@jsx` comment or `settings.react.pragma` names another function, that variable is counted instead of `React`. A `<>` fragment also counts as a use of `Fragment`, or of the name in `settings.react.fragment`.

This rule is on by default.

{/* never reports */}

## Examples

With this rule on, `no-unused-vars` doesn't report `React` here:

{/* good */}
```jsx

  return <p>Hello</p>;
}
```

And it doesn't report `h` here:

{/* good */}
```jsx
/** @jsx h */

  return <p>Hello</p>;
}
```

## When not to use it

With the automatic JSX runtime in React 17 and later, you don't import `React` for JSX. Turn this rule off so a leftover import gets reported:

```toml bunfig.toml
[lint.rules]
"react/jsx-uses-react" = "off"
```
