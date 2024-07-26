import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint'

export default defineConfig({
    plugins: [
        eslintPlugin(),
        vue()
    ],
    build: {
        sourcemap: true,
    },
    resolve: {
        alias: { '@': path.resolve('src') },
    },
    base: '/clicking-bad',
})
