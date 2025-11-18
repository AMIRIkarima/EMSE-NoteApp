import { fileURLToPath, URL } from 'node:url'
import type { UserConfig } from 'vite';

import { defineConfig } from 'vite'
import {default as vue} from '@vitejs/plugin-vue'
import {default as vueDevTools} from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  css: {
    devSourcemap: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
}) satisfies UserConfig
