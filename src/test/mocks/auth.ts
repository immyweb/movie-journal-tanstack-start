import { vi } from 'vitest'

// Global, rather than per test file: _authed.tsx's guard sits in front of
// every authed route, so every authed-page test needs getSession() mocked.
// See render-authed-route.tsx for how tests configure the resolved session.
vi.mock('#/lib/auth/functions', () => ({
  getSession: vi.fn(),
  ensureSession: vi.fn(),
}))
