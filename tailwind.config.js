import plugin from 'tailwindcss/plugin';

/** @type {import("tailwindcss").Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{ts,vue}'
    ],
    theme:   {
        extend: {
            textShadow: {
                DEFAULT: '0 1px 1px #333333',
                none: 'none',
            }
        },
    },
    plugins: [
        plugin(({ matchUtilities, theme }) => {
            matchUtilities(
                {
                    'text-shadow': (value) => ({
                        textShadow: value,
                    }),
                },
                { values: theme('textShadow') },
            )
        }),
    ],
};
