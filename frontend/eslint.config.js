import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // ══════════════════════════════════════════════════════
      // 🔴 SMRITI-OS SOVEREIGN RULES — DO NOT DISABLE
      // See: AI_ATOMIC_RULES.md for full protocol
      // ══════════════════════════════════════════════════════

      // RULE-005: No `any` in TypeScript — ATOMIC RULE
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "warn",

      // RULE-001: No role-based UI checks — use hasPermission()
      // RULE-002: No hardcoded colors in className strings
      "no-restricted-syntax": [
        "error",
        {
          // Blocks: user.role === 'x' pattern
          selector: "BinaryExpression[operator='==='][left.property.name='role']",
          message:
            "[SMRITI-OS RULE-001] Never check user.role directly. Use user.hasPermission('x.y') instead. See AI_ATOMIC_RULES.md.",
        },
        {
          // Blocks: localStorage.setItem for auth tokens
          selector: "CallExpression[callee.object.name='localStorage'][callee.property.name='setItem']",
          message:
            "[SMRITI-OS RULE-004] Never use localStorage for auth data. Use Supabase session only. See AI_ATOMIC_RULES.md.",
        },
        {
          // Blocks: <DataTable columns={[]} /> or manually passing arrays instead of useGridMask output
          selector: "JSXElement[openingElement.name.name='DataTable'] > JSXOpeningElement > JSXAttribute[name.name='columns'] > JSXExpressionContainer > ArrayExpression",
          message:
            "[SMRITI-OS GRID POLICY] FATAL: Never hardcode DataTable columns arrays. You MUST use the useGridMask() hook powered by GridEngine to ensure AcceptDisplayDtls institutional parity.",
        },
        {
          // Blocks: useMemo(() => [...]) being passed to columns (naive check for non-colDefs named variables)
          selector: "JSXElement[openingElement.name.name='DataTable'] > JSXOpeningElement > JSXAttribute[name.name='columns'] > JSXExpressionContainer > Identifier[name='columns']",
          message:
            "[SMRITI-OS GRID POLICY] FATAL: Stale 'columns' variable detected. You MUST pass the generated colDefs from useGridMask(TrnType) to the DataTable.",
        }
      ],
    },
  }
);
