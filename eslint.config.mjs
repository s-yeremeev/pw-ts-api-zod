import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import sonarjs from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from 'eslint/config'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default defineConfig([
  globalIgnores([
    'node_modules/',
    'dist/',
    'reports/',
    'test-results/',
    'playwright-report/',
    'docs/',
    'eslint.config.mjs',
    '.claude/skills/**/evals/',
    'k6/**',
  ]),
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:playwright/playwright-test', 'plugin:prettier/recommended'),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      sonarjs,
      unicorn,
    },
    rules: {
      ...sonarjs.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,
      'sonarjs/cognitive-complexity': 'error',
      'sonarjs/no-duplicate-string': 'error',
      'sonarjs/no-commented-code': 'warn',
      'sonarjs/todo-tag': 'warn',
      'playwright/no-focused-test': 'warn',
      'playwright/expect-expect': 'off',
      'playwright/no-networkidle': 'off',
      'unicorn/prevent-abbreviations': ['error', { allowList: { util: true, utils: true, args: true, params: true, env: true, props: true, ref: true } }],
      'unicorn/no-null': 'off',
      'unicorn/filename-case': ['error', { cases: { kebabCase: true } }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
