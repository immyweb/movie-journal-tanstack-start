import { describe, expect, it, vi } from 'vitest'

import { db } from '#/lib/db'
import { deleteListForUser } from '#/lib/lists/delete-list'

vi.mock('#/lib/db', () => ({
  db: { delete: vi.fn() },
}))

function mockDeleteResult(rows: Array<unknown>) {
  const where = vi
    .fn()
    .mockReturnValue({ returning: vi.fn().mockResolvedValue(rows) })
  vi.mocked(db.delete).mockReturnValue({ where } as never)
}

describe('deleteListForUser', () => {
  it('deletes and returns the list when owned by the caller', async () => {
    mockDeleteResult([{ id: 'list_1', userId: 'user_1' }])

    const result = await deleteListForUser('user_1', 'list_1')

    expect(result).toEqual({ id: 'list_1', userId: 'user_1' })
  })

  // The ownership check and the delete are the same atomic statement here
  // (WHERE id = ? AND userId = ?), so a list belonging to a different user
  // deletes nothing and the RETURNING clause comes back empty — this is
  // issue #20 finding 5's cross-user ownership-bypass (IDOR) test.
  it('throws for a list owned by a different user, deleting nothing', async () => {
    mockDeleteResult([])

    await expect(deleteListForUser('attacker', 'list_1')).rejects.toThrow(
      'This list no longer exists.',
    )
  })
})
