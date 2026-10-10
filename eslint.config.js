import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const reactHooksConfig = reactHooks.configs?.recommended || reactHooks.configs?.['recommended-latest'] || {};

export default [
  { ignores: ['dist/', '.next/', 'node_modules/', '*.config.*', 'drizzle/'] },
  ...typescriptEslint.configs.recommended,
  reactHooksConfig,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-refresh': reactRefresh },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];