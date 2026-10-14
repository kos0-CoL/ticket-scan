import js from '@eslint/js';
import tsESLint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/.turbo/**',
      '**/dist/**',
      '**/next-env.d.ts'
    ]
  },
  js.configs.recommended,
  ...tsESLint.configs.recommended,
  {
    files: ['**/next.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs'
    }
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts', '**/*.tsx'],
    ignores: ['**/next.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  }
];