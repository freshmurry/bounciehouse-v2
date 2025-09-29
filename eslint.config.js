import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      // Project uses React 18 automatic JSX runtime and many components don't use PropTypes.
      // Relax these rules here so lint output is actionable and not noisy.
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      // Many files import React for older patterns; allow unused vars for React import to avoid
      // widespread no-unused-vars errors. Developers can remove unused imports during cleanup.
      'no-unused-vars': ['warn', { 'varsIgnorePattern': '^React$' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Node/env overrides for config files
  {
    files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js', 'eslint.config.js'],
    rules: {
      'no-undef': 'off'
    },
    languageOptions: {
      globals: { node: true }
    }
  }
]
