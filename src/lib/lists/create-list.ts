import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'

import { db } from '#/lib/db'
import { list } from '#/lib/db/schema'
import { getPgErrorCause } from '#/lib/db/pg-error'
import { ensureSession } from '#/lib/auth/functions'
import { createListSchema, type CreateListInput } from '#/lib/validation/list'

// postgres' check-violation error code — see
// https://www.postgresql.org/docs/current/errcodes-appendix.html. Not
// normally reachable (createListSchema's own length caps reject an
// over-length name/description before this insert runs), but caught here
// too so the DB's own length constraint — added as a backstop in
// drizzle/0004_silent_karma.sql — can't leak a raw postgres error the same
// way an untrapped one could (issue #20, finding 3's pattern). Scoped to
// list's own two length constraints by name, not just the error code, so a
// future unrelated CHECK constraint on `list` wouldn't be mislabeled the
// same way.
const CHECK_VIOLATION = '23514'
const LENGTH_CHECK_CONSTRAINTS = new Set([
  'list_name_length',
  'list_description_length',
])

export const createListForUser = createServerOnlyFn(
  async function createListForUser(userId: string, data: CreateListInput) {
    try {
      const [created] = await db
        .insert(list)
        .values({ userId, name: data.name, description: data.description })
        .returning()

      return created
    } catch (error) {
      const pgError = getPgErrorCause(error)

      if (
        pgError?.code === CHECK_VIOLATION &&
        pgError.constraint &&
        LENGTH_CHECK_CONSTRAINTS.has(pgError.constraint)
      ) {
        throw new Error('Name or description is too long.')
      }
      throw error
    }
  },
)

export const createList = createServerFn({ method: 'POST' })
  .validator(createListSchema)
  .handler(async ({ data }) => {
    const session = await ensureSession()
    return createListForUser(session.user.id, data)
  })
