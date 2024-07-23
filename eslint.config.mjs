import eslint from '@eslint/js'
import tsEslintParser from '@typescript-eslint/parser'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(
    {
        ignores: ['node_modules/', 'coverage/', 'dist/', '.yarn/'],
    },
    eslint.configs.recommended,
    ...tsEslint.configs.recommended,
    ...pluginVue.configs['flat/strongly-recommended'],
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tsEslintParser,
            },
        },
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },

        rules: {
            'comma-dangle': ['warn', 'only-multiline'],

            indent: ['warn', 4, {
                SwitchCase: 1,
            }],

            'no-multiple-empty-lines': ['warn', {
                max: 2,
                maxEOF: 0,
                maxBOF: 0,
            }],

            quotes: ['error', 'single', {
                avoidEscape: true,
                allowTemplateLiterals: true,
            }],

            'space-before-function-paren': ['warn', {
                anonymous: 'never',
                named: 'never',
                asyncArrow: 'always',
            }],

            '@typescript-eslint/no-explicit-any': 'off',

            'vue/first-attribute-linebreak': ['error', {
                'singleline': 'beside',
                'multiline': 'beside',
            }],
            'vue/html-closing-bracket-newline': ['error', {
                singleline: 'never',
                multiline: 'never',
                selfClosingTag: {
                    singleline: 'never',
                    multiline: 'never',
                },
            }],
            'vue/html-indent': ['error', 4, {
                alignAttributesVertically: true,
            }],

            'vue/max-attributes-per-line': ['error', {
                singleline: { max: 3 },
                multiline: { max: 1 },
            }],

            'vue/multi-word-component-names': ['off'],
            'vue/singleline-html-element-content-newline': ['off']
        },
    },
)
