/**
 * @author Diogo Esteves
 * See LICENSE file in root directory for full license.
 */
import { RuleTester } from '../../eslint-compat'
import rule from '../../../lib/rules/no-shadow'
import tsParser from '@typescript-eslint/parser'
import vueEslintParser from 'vue-eslint-parser'

const tester = new RuleTester({
  languageOptions: {
    parser: vueEslintParser,
    ecmaVersion: 2020,
    sourceType: 'module'
  }
})

tester.run('no-shadow', rule, {
  valid: [
    {
      // https://github.com/vuejs/eslint-plugin-vue/issues/1800
      filename: 'test.vue',
      code: `
      <script>
      export function useModal() {
        const close = () => {}

        return { close }
      }
      </script>

      <script setup>
      function close() {}
      </script>

      <template>
        <Modal @close="close"></Modal>
      </template>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      function close() {}
      </script>

      <script>
      export function useModal() {
        const close = () => {}
        return { close }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export function useCounter(count) {
        const double = count * 2
        return { count, double }
      }
      </script>

      <script setup>
      const count = 1
      const double = count * 2
      </script>
      `,
      options: [{ hoist: 'all' }]
    },
    {
      filename: 'test.vue',
      code: `
      <script lang="ts">
      export function useModal() {
        const close = (): void => {}
        return { close }
      }
      </script>

      <script setup lang="ts">
      function close(): void {}
      </script>
      `,
      languageOptions: { parserOptions: { parser: tsParser } }
    },
    {
      filename: 'test.js',
      code: `
      const a = 1
      function foo(b) {
        return b
      }
      `
    }
  ],
  invalid: [
    {
      // shadowing inside `<script setup>` is still reported
      filename: 'test.vue',
      code: `
      <script>
      export default {}
      </script>

      <script setup>
      const close = () => {}
      function onClose() {
        const close = 1
        return close
      }
      </script>
      `,
      errors: [
        {
          message:
            "'close' is already declared in the upper scope on line 7 column 13.",
          line: 9,
          column: 15,
          endLine: 9,
          endColumn: 20
        }
      ]
    },
    {
      // `<script setup>` declarations that shadow `<script>` declarations are still reported
      filename: 'test.vue',
      code: `
      <script>
      const close = () => {}
      export default {}
      </script>

      <script setup>
      function onClose() {
        const close = 1
        return close
      }
      </script>
      `,
      errors: [
        {
          message:
            "'close' is already declared in the upper scope on line 3 column 13.",
          line: 9,
          column: 15,
          endLine: 9,
          endColumn: 20
        }
      ]
    },
    {
      // imports in `<script setup>` are hoisted to the module scope, so shadowing them is still reported
      filename: 'test.vue',
      code: `
      <script setup>
      import { close } from './modal'
      </script>

      <script>
      export function useModal() {
        const close = () => {}
        return { close }
      }
      </script>
      `,
      errors: [
        {
          message:
            "'close' is already declared in the upper scope on line 3 column 16.",
          line: 8,
          column: 15,
          endLine: 8,
          endColumn: 20
        }
      ]
    },
    {
      // shadowing between scopes of `<script>` is still reported
      filename: 'test.vue',
      code: `
      <script>
      export function useModal() {
        const close = () => {}
        function onClose() {
          const close = 1
          return close
        }
        return { close, onClose }
      }
      </script>

      <script setup>
      function close() {}
      </script>
      `,
      errors: [
        {
          message:
            "'close' is already declared in the upper scope on line 4 column 15.",
          line: 6,
          column: 17,
          endLine: 6,
          endColumn: 22
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      const a = 1
      function foo(a) {
        return a
      }
      </script>
      `,
      errors: [
        {
          message:
            "'a' is already declared in the upper scope on line 3 column 13.",
          line: 4,
          column: 20,
          endLine: 4,
          endColumn: 21
        }
      ]
    }
  ]
})
