import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest,
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration[async=true]',
          message: 'async/await запрещён в основном коде. Используйте промисы (.then/.catch)',
        },
        {
          selector: 'FunctionExpression[async=true]',
          message: 'async/await запрещён в основном коде. Используйте промисы (.then/.catch)',
        },
        {
          selector: 'ArrowFunctionExpression[async=true]',
          message: 'async/await запрещён в основном коде. Используйте промисы (.then/.catch)',
        },
        {
          selector: 'AwaitExpression',
          message: 'async/await запрещён в основном коде. Используйте промисы (.then/.catch)',
        },
      ],
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/operator-linebreak': ['error', 'before'],
      '@stylistic/brace-style': ['error', 'stroustrup'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/eol-last': ['error', 'always'],
    },
  },
  {
    files: ['src/bin/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['__tests__/**/*.js', '**/*.test.js'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]
