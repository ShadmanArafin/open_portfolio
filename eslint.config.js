import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  // `.next` holds generated output — linting it reports thousands of problems
  // in code nobody wrote and nobody can fix.
  { ignores: ['.next', 'next-env.d.ts', 'node_modules', 'coverage', 'dist'] },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Unused variables are worth flagging, but an intentionally-ignored
      // argument prefixed with _ is a deliberate signal, not an oversight.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],

      // `any` is still present in a few places inherited from the original
      // build. Warn so it shows up, rather than erroring and blocking work.
      '@typescript-eslint/no-explicit-any': 'warn',

      // The two a11y rules the current codebase most needs enforced, promoted
      // from the recommended set's defaults.
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',

      // These two come from the React Compiler ruleset and flag long-standing
      // patterns across the existing components (id generation during render,
      // a capability check that sets state on mount). They are worth seeing but
      // not worth blocking on: the files they point at are being rewritten as
      // Server/Client components during the Next.js migration. Promote to
      // 'error' once that lands.
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Config files run in Node, not the browser.
  {
    files: ['*.config.{js,ts}', 'scripts/**/*.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  }
);
