import { describe, expect, it, vi } from 'vitest'

import { db } from '#/lib/db'
import { removeListItemForUser } from '#/lib/lists/remove-list-item'

vi.mock('#/lib/db', () => ({
  db: { transaction: vi.fn() },
}))

function createTx(owned: unknown) {
  return {
    query: { list: { findFirst: vi.fn().mockResolvedValue(owned) } },
    delete: vi
      .fn()
      .mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  }
}

describe('removeListItemForUser', () => {
  it('removes the item when the list is owned by the caller', async () => {
    const tx = createTx({ id: 'list_1', userId: 'user_1' })
    vi.mocked(db.transaction).mockImplementation((fn) => fn(tx as never))

    await removeListItemForUser('user_1', {
      listId: 'list_1',
      tmdbId: 'tmdb_1',
    })

    expect(tx.delete).toHaveBeenCalled()
  })

  // Issue #20 finding 5's cross-user ownership-bypass (IDOR) test.
  it('throws and removes nothing for a list owned by a different user', async () => {
    const tx = createTx(undefined)
    vi.mocked(db.transaction).mockImplementation((fn) => fn(tx as never))

    await expect(
      removeListItemForUser('attacker', { listId: 'list_1', tmdbId: 'tmdb_1' }),
    ).rejects.toThrow('This list no longer exists.')
    expect(tx.delete).not.toHaveBeenCalled()
  })
})
