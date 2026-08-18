import { describe, expect, it, vi } from 'vitest'
import { DrizzleQueryError } from 'drizzle-orm'

import { db } from '#/lib/db'
import { createListForUser } from '#/lib/lists/create-list'

vi.mock('#/lib/db', () => ({
  db: { insert: vi.fn() },
}))

function mockInsertResult(rows: Array<unknown>) {
  const returning = vi.fn().mockResolvedValue(rows)
  vi.mocked(db.insert).mockReturnValue({
    values: vi.fn().mockReturnValue({ returning }),
  } as never)
}

function mockInsertError(error: unknown) {
  vi.mocked(db.insert).mockReturnValue({
    values: vi
      .fn()
      .mockReturnValue({ returning: vi.fn().mockRejectedValue(error) }),
  } as never)
}

describe('createListForUser', () => {
  it('creates and returns the list', async () => {
    mockInsertResult([{ id: 'list_1', userId: 'user_1', name: 'A list' }])

    const result = await createListForUser('user_1', {
      name: 'A list',
      description: null,
    })

    expect(result).toEqual({ id: 'list_1', userId: 'user_1', name: 'A list' })
  })

  // Issue #20, finding 3's "reword a raw DB-constraint error" pattern,
  // applied to createListSchema's own length caps (finding 4) — not
  // normally reachable since Zod already rejects an over-length input, but
  // a backstop in case that cap and the DB's CHECK constraint ever drift.
  it('rewords a check-constraint violation as a friendly message', async () => {
    const checkError = Object.assign(new Error('value too long'), {
      code: '23514',
      constraint: 'list_name_length',
    })
    mockInsertError(
      new DrizzleQueryError('insert into "list" ...', [], checkError),
    )

    await expect(
      createListForUser('user_1', { name: 'A list', description: null }),
    ).rejects.toThrow('Name or description is too long.')
  })

  // Scoped by constraint name, not just the error code, so an unrelated
  // future CHECK constraint on `list` wouldn't be mislabeled the same way.
  it('does not reword a check-constraint violation on an unrelated constraint', async () => {
    const checkError = Object.assign(new Error('some other check failed'), {
      code: '23514',
      constraint: 'some_other_check',
    })
    mockInsertError(
      new DrizzleQueryError('insert into "list" ...', [], checkError),
    )

    await expect(
      createListForUser('user_1', { name: 'A list', description: null }),
    ).rejects.toMatchObject({ cause: checkError })
  })

  it('re-throws an unrelated insert error as-is', async () => {
    mockInsertError(new Error('connection reset'))

    await expect(
      createListForUser('user_1', { name: 'A list', description: null }),
    ).rejects.toThrow('connection reset')
  })
})
