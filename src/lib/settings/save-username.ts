import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { APIError } from 'better-auth'

import { auth } from '#/lib/auth'
import { ensureSession } from '#/lib/auth/functions'
import { saveUsernameSchema } from '#/lib/validation/settings'

// Format and reserved-word checks already ran client-side (saveUsernameSchema,
// ADR 0014) in the common case, but the client can be bypassed — so this
// re-runs the same schema here rather than handing it straight to
// createServerFn's default validator, whose failure path throws a raw
// JSON.stringify of Zod issues instead of the schema's own user-facing
// messages. safeParse lets us surface the first issue's message instead,
// keeping server-side failures readable and consistent with the client.
// Kept as a plain function so it's callable directly in tests — the
// createServerFn-wrapped export needs the Start server's request context
// (see ADR 0011's note on calling handlers directly).
export function parseSaveUsernameInput(data: unknown) {
  const result = saveUsernameSchema.safeParse(data)
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? 'Invalid username.')
  }
  return result.data
}

// The handler below only has to translate Better Auth's own uniqueness
// check into a user-facing message. auth.api.updateUser (not authClient) so
// the write happens server-side, alongside every other mutation in this
// codebase.
export const saveUsername = createServerFn({ method: 'POST' })
  .validator(parseSaveUsernameInput)
  .handler(async ({ data }) => {
    await ensureSession()
    const headers = getRequestHeaders()

    try {
      await auth.api.updateUser({
        headers,
        body: { username: data.username },
      })
    } catch (error) {
      if (
        error instanceof APIError &&
        error.body?.code === 'USERNAME_IS_ALREADY_TAKEN'
      ) {
        throw new Error('That username is already taken.')
      }
      throw new Error('Could not save that username. Please try again.')
    }
  })
