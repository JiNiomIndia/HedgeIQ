import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Vitest-only config — used by "npm test", not by "npm run build"
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/', 'e2e/'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'e2e/',
        '*.config.*',
        // Widget files have no dedicated tests yet — excluded from threshold enforcement
        // until a widget test suite is added (tracked as tech-debt item)
        'src/widgets/',
        // icons.tsx is a barrel file re-exporting Lucide icons — not testable logic
        'src/lib/icons.tsx',
      ],
      thresholds: {
        statements: 65,
        branches: 55,
        // Functions at 55%: PositionDrawer and OptionsChain have many untested
        // interactive handlers. Raise to 60% when those are covered.
        functions: 55,
        lines: 65,
      },
    },
  },
})
