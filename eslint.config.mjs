import js from '@eslint/js';
import globals from 'globals';
import nextPlugin from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

const lintedGlobs = ['app/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}', 'src/components/layout/**/*.{ts,tsx}'];

export default tseslint.config([
  {
    ignores: ['.next', 'dist', 'node_modules'],
  },
  {
    files: lintedGlobs,
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: {
      '@next/next': nextPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
    },
  },
]);
