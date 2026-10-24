/**
 * @author Diogo Esteves
 * See LICENSE file in root directory for full license.
 */
import type { Rule, Scope } from 'eslint'
import utils from '../utils/index.js'

const coreRule = utils.getCoreRule('no-shadow')!

function isInside(node: { range: Range }, element: VElement): boolean {
  return element.range[0] <= node.range[0] && node.range[1] <= element.range[1]
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'disallow variable declarations from shadowing variables declared in the outer scope',
      categories: undefined,
      url: 'https://eslint.vuejs.org/rules/no-shadow.html'
    },
    schema: coreRule.meta!.schema,
    // The core rule relies on its `defaultOptions` since ESLint v9.
    defaultOptions: (coreRule.meta as { defaultOptions?: unknown[] })
      .defaultOptions,
    messages: coreRule.meta!.messages
  },
  create(context: RuleContext) {
    const sourceCode = context.sourceCode
    const scriptSetup = utils.getScriptSetupElement(context)
    const df = sourceCode.parserServices.getDocumentFragment?.()
    const script = df?.children.find(
      (node): node is VElement =>
        node.type === 'VElement' &&
        node.name === 'script' &&
        node !== scriptSetup
    )
    if (!scriptSetup || !script) {
      return coreRule.create(context)
    }

    /**
     * Checks whether the given variable is a top-level binding of `<script setup>`.
     * Vue compiles these into the `setup()` function, so code in `<script>` can't see them.
     * Imports are hoisted to the module scope, so they don't count.
     */
    function isScriptSetupBinding(variable: Scope.Variable): boolean {
      return (
        variable.defs.length > 0 &&
        variable.defs.every(
          (def) =>
            def.type !== 'ImportBinding' && isInside(def.name, scriptSetup!)
        )
      )
    }

    /**
     * Checks whether the given identifier declares a variable in `<script>`
     * whose shadowed variable is a top-level binding of `<script setup>`.
     */
    function isShadowingScriptSetupBinding(node: Identifier): boolean {
      if (!isInside(node, script!)) {
        return false
      }
      for (const scope of sourceCode.scopeManager.scopes) {
        const variable = scope.variables.find((variable) =>
          variable.identifiers.includes(node)
        )
        if (!variable) {
          continue
        }
        let upper = scope.upper
        while (upper) {
          const shadowed = upper.set.get(variable.name)
          if (shadowed) {
            return isScriptSetupBinding(shadowed)
          }
          upper = upper.upper
        }
        return false
      }
      return false
    }

    return coreRule.create(
      Object.create(context, {
        report: {
          value(descriptor: Rule.ReportDescriptor) {
            const node =
              'node' in descriptor ? (descriptor.node as ESNode) : null
            if (
              node?.type === 'Identifier' &&
              isShadowingScriptSetupBinding(node)
            ) {
              return
            }
            context.report(descriptor)
          }
        }
      })
    )
  }
}
