---
name: bun-lint-rules-react-jsx-uses-vars
description: "Count a variable as used when it is the name of a JSX tag. Use when working with Bun: react/jsx-uses-vars (bun docs lint/rules/react/jsx-uses-vars.mdx)."
---

# react/jsx-uses-vars

`` reads the variable `Header`. ESLint 9 and older don't count a tag name in a JavaScript file as a use, so `no-unused-vars` reports every component that's only used in JSX.

This rule reports nothing itself. While it's on, a tag's name counts as a use of that variable. In `` that's `Menu`. Tags that start with a lowercase letter, such as `<div>`, are HTML elements and don't count as a use of anything.

{/* never reports */}

## Examples

With this rule on, `no-unused-vars` doesn't report `Header` or `Menu` here:

{/* good */}
```jsx

  return (
    
      
    
  );
}
```

## When not to use it

You only need it if your project has an ESLint config and ESLint 9 or older installed. With ESLint 10, an oxlint config, or `bunfig.toml` alone, tag names count as uses without it.
