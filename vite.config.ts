import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/loop-list/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
