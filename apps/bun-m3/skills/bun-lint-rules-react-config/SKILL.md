---
name: bun-lint-rules-react-config
description: "Report an invalid configuration of the React Compiler. Use when working with Bun: react-hooks/config (bun docs lint/rules/react/config.mdx)."
---

# react-hooks/config

You can tell the React Compiler what a module's exports are, for example which ones are hooks. It reports here when that description contradicts itself, such as a hook with a name that doesn't start with `use`.

`bun lint` runs the compiler's checks with a fixed, valid configuration, so this rule has nothing to report. It exists because the `recommended` config in `eslint-plugin-react-hooks` turns it on, and an ESLint config that does that needs to keep working.

{/* never reports */}

## Examples

Not reported:

{/* good */}
```jsx

function SignUp() {
  const { register } = useForm();
  return <input {...register("email")} />;
}
```
