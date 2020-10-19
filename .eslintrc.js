module.exports = {
    root: true,

    env: {
        node: true
    },

    extends: [
        'plugin:vue/vue3-essential',
        '@vue/standard',
        '@vue/typescript/recommended',
        '@vue/typescript'
    ],

    parserOptions: {
        ecmaVersion: 2020,
        parser: '@typescript-eslint/parser'
    },

    rules: {
        'comma-dangle': ["warn", "only-multiline"],
        indent: ["warn", 4, {
            SwitchCase: 1,
        }],
        'no-console': process.env.NODE_ENV === 'production' ? "warn" : "off",
        'no-debugger': process.env.NODE_ENV === 'production' ? "warn" : "off",
        'no-multiple-empty-lines': ["warn", { max: 2, maxEOF: 0, maxBOF: 0 }],
        quotes: 0,
        'space-before-function-paren': ["warn", {
            anonymous: "never",
            named: "never",
            asyncArrow: "always"
        }],
        '@typescript-eslint/no-empty-function': "off",
        '@typescript-eslint/no-explicit-any': "off",
        '@typescript-eslint/member-delimiter-style': "off",
    },
}
