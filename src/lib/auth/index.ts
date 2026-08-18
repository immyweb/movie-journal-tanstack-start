import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { username } from 'better-auth/plugins'

import { db } from '#/lib/db'
import * as schema from '#/lib/db/schema'

// Email/password only, per ADR 0003 — no OAuth providers.
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Contributes the `username`/`displayUsername` columns and their
  // persistence + uniqueness check (ADR 0014). Format (length, charset) and
  // the reserved-word denylist are app-level, not plugin config —
  // enforced by usernameSchema (src/lib/validation/settings.ts) before a
  // username ever reaches this plugin's own /update-user handling.
  plugins: [tanstackStartCookies(), username()],
})
