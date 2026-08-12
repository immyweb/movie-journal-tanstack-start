import { defineConfig, devices } from '@playwright/test'

// E2E-only per ADR 0006: critical CRUD journeys (sign up/in, add movie,
// edit entry, delete entry, view/filter journal), with axe-core assertions
// folded into those same tests for the WCAG AA requirement — no separate
// a11y suite, no unit tests, no cross-browser matrix.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
