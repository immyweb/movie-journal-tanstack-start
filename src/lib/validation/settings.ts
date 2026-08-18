import { z } from 'zod'

// Mirrors ADR 0014's username shape: lowercase, 3-20 characters of
// a-z0-9_, checked against the reserved-word denylist at write time.
// Better Auth's own charset/length rules are looser than this (ADR 0014)
// and aren't relied on — this schema is the actual source of truth, used
// both client-side (zodResolver) and server-side (saveUsername's
// .validator), so the two can never drift. Already-taken isn't checked
// here — Better Auth's username plugin owns that at persistence time
// (src/lib/settings/save-username.ts).
const RESERVED_USERNAMES = new Set([
  'journal',
  'register',
  'sign-in',
  'api',
  'lists',
  'login',
  'settings',
  'admin',
])

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Must be 3–20 characters.')
  .max(20, 'Must be 3–20 characters.')
  .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores.')
  .refine((value) => !RESERVED_USERNAMES.has(value), {
    message: 'That username is reserved.',
  })

export const saveUsernameSchema = z.object({ username: usernameSchema })

export type SaveUsernameInput = z.infer<typeof saveUsernameSchema>
