import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest-only config — used by "npm test", not by "npm run build"
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/', 'e2e/'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'src/test/', 'e2e/', '*.config.*'],
    },
  },
})
