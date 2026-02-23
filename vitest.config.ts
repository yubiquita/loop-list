/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['src/test-utils/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/test-utils/**',
        'src/**/*.test.{ts,js}',
        'src/**/*.spec.{ts,js}',
        'src/main.ts',
        'src/vite-env.d.ts'
      ]
    }
  }
})