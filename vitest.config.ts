import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// Deliberately separate from vite.config.ts (ADR-0011): keeps the TanStack
// Start SSR/RPC compiler plugin out of the test pipeline.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
