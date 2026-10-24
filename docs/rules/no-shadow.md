---
pageClass: rule-details
sidebarDepth: 0
title: vue/no-shadow
description: disallow variable declarations from shadowing variables declared in the outer scope
---

# vue/no-shadow

> disallow variable declarations from shadowing variables declared in the outer scope

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> _**This rule has not been released yet.**_ </badge>

## :book: Rule Details

This rule is the same rule as core [no-shadow] rule, but it understands components that have both `<script>` and `<script setup>`.

ESLint sees both blocks as one module, so the core rule reports a variable in `<script>` that has the same name as a top-level variable in `<script setup>`. Vue compiles `<script setup>` into the component's `setup()` function, though, so code in `<script>` can't see those variables and nothing is shadowed. This rule doesn't report those cases. Imports in `<script setup>` are still treated as module-level bindings, because Vue hoists them out of `setup()`.

To use it, turn off the core rule:

```json
{
  "rules": {
    "no-shadow": "off",
    "vue/no-shadow": "error"
  }
}
```

<eslint-code-block :rules="{'vue/no-shadow': ['error']}">

```vue
<script>
export function useModal() {
  /* ✓ GOOD */
  const close = () => {}

  return { close }
}
</script>

<script setup>
function close() {}

function onClose() {
  /* ✗ BAD */
  const close = () => {}
  close()
}
</script>
```

</eslint-code-block>

## :wrench: Options

This rule has the same options as the core [no-shadow] rule.

## :books: Further Reading

- [no-shadow]
- [API - `<script setup>` - Usage alongside normal `<script>`](https://vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script)

[no-shadow]: https://eslint.org/docs/latest/rules/no-shadow

## :mag: Implementation

- [Rule source](https://github.com/vuejs/eslint-plugin-vue/blob/master/lib/rules/no-shadow.ts)
- [Test source](https://github.com/vuejs/eslint-plugin-vue/blob/master/tests/lib/rules/no-shadow.test.ts)
