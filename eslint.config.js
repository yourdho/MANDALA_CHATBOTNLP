import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    {
        files: ['resources/js/**/*.{js,jsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooks,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
                route: 'readonly',   // Ziggy
                axios: 'readonly',
            },
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            // React
            ...reactPlugin.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',       // Tidak diperlukan di React 17+
            'react/prop-types': 'off',                 // Tidak pakai PropTypes (pakai TypeScript/Zod)
            'react/display-name': 'warn',

            // General
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
        },
    },
    {
        // Test files — lebih longgar
        files: ['tests/**/*.js'],
        languageOptions: { globals: globals.node },
    },
    {
        // Ignore build output dan vendor
        ignores: ['public/build/**', 'vendor/**', 'node_modules/**'],
    },
]
