---
name: bun-lint-rules-react-fbt
description: "Reserved for problems with `fbt` translations in the React Compiler: reports nothing. Use when working with Bun: react-hooks/fbt (bun docs lint/rules/react/fbt.mdx)."
---

# react-hooks/fbt

This rule reports nothing. The React Compiler has a category for problems with `fbt`, a translation library, but none of its checks use that category. The rule exists because `eslint-plugin-react-hooks` has it, so a config that mentions it keeps working.

When the compiler can't handle something in an `<fbt>` element, such as two `<fbt:plural>` tags in one element, `react-hooks/todo` reports it.

{/* never reports */}

## Examples

Not reported:

{/* good */}
```jsx

function Summary({ files, folders }) {
  return (
    <fbt desc="what was selected">
      <fbt:plural count={files} name="files">file</fbt:plural>
      <fbt:plural count={folders} name="folders">folder</fbt:plural>
    </fbt>
  );
}
```
