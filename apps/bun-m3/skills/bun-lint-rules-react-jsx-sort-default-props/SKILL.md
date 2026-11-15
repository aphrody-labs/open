---
name: bun-lint-rules-react-jsx-sort-default-props
description: "Require the keys of `defaultProps` to be sorted alphabetically. Use when working with Bun: react/jsx-sort-default-props (bun docs lint/rules/react/jsx-sort-default-props.mdx)."
---

# react/jsx-sort-default-props

In a long `defaultProps` object, a fixed order makes a prop quick to find and makes a duplicate stand out.

This is the old name for `react/sort-default-props`, which does the same thing. Use that name in new configs.

Capital letters sort before lowercase ones. After a spread, sorting starts over.

`eslint-plugin-react` has deprecated this rule. Use `react/sort-default-props` instead.

## Examples

Reported:

{/* bad */}
```jsx
function Button({ label, size }) {
  return <button className={size}>{label}</button>;
}

Button.defaultProps = {
  size: "medium",
  label: "OK",
};
```

Not reported:

{/* good */}
```jsx
function Button({ label, size }) {
  return <button className={size}>{label}</button>;
}

Button.defaultProps = {
  label: "OK",
  size: "medium",
};
```

{/* good */}
```jsx
class Button extends React.Component {
  static defaultProps = {
    size: "medium",
    ...shared,
    label: "OK",
  };
}
```

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `ignoreCase` | `false` | Ignore case when comparing the keys. |

{/* bad */}
```jsx
Button.defaultProps = {
  ariaLabel: "",
  Icon: null,
};
```

{/* good {"options": [{"ignoreCase": true}]} */}
```jsx
Button.defaultProps = {
  ariaLabel: "",
  Icon: null,
};
```
