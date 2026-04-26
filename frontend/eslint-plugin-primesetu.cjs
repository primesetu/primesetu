// ============================================================
// PrimeSetu — ESLint Design System Enforcement Rules
// © 2026 AITDL Network
// These rules enforce DESIGN_LOCK.md at code-author time.
// ============================================================

/** @type {import('eslint').Rule.RuleModule} */
const noHardcodedColors = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow hardcoded color values — use CSS var() tokens' },
    messages: {
      hardcodedHex: 'Hardcoded color "{{ value }}" is banned. Use var(--token) from DESIGN_LOCK.md.',
      bannedClass: 'Class "{{ value }}" is banned by PrimeSetu Design Lock. See DESIGN_LOCK.md.',
    }
  },
  create(context) {
    const BANNED_CLASSES = [
      'bg-white', 'text-black', 'bg-navy', 'bg-brand-gold',
      'text-emerald-', 'text-rose-', 'bg-emerald-', 'bg-rose-',
      'font-black',
    ]
    const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/

    function checkStringForBanned(node, value) {
      if (!value || typeof value !== 'string') return

      // Hex colors
      if (HEX_PATTERN.test(value) && !value.includes('var(')) {
        context.report({ node, messageId: 'hardcodedHex', data: { value } })
      }

      // Banned Tailwind classes
      for (const banned of BANNED_CLASSES) {
        if (value.includes(banned)) {
          context.report({ node, messageId: 'bannedClass', data: { value: banned } })
        }
      }
    }

    return {
      JSXAttribute(node) {
        if (!node.value) return
        const attrName = node.name?.name

        // className="..."
        if (attrName === 'className') {
          if (node.value.type === 'Literal') {
            checkStringForBanned(node, node.value.value)
          }
        }

        // style={{ color: '#xxx' }}
        if (attrName === 'style') {
          if (node.value?.expression?.type === 'ObjectExpression') {
            node.value.expression.properties.forEach(prop => {
              if (prop.value?.type === 'Literal') {
                const val = prop.value.value
                if (typeof val === 'string' && HEX_PATTERN.test(val)) {
                  context.report({ node: prop, messageId: 'hardcodedHex', data: { value: val } })
                }
              }
            })
          }
        }
      }
    }
  }
}

module.exports = {
  rules: { 'no-hardcoded-colors': noHardcodedColors }
}
