import { describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'

import { list } from '#/lib/db/schema'
import { listOwnershipWhere } from '#/lib/lists/ensure-list-ownership'

// Wraps the real `eq` so the condition's actual comparisons are inspectable
// — asserting on Drizzle's own SQL fragment internals would be fragile, but
// capturing what gets passed *into* `eq` isn't (same trick as
// get-public-journal.test.ts).
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()
  return { ...actual, eq: vi.fn(actual.eq) }
})

describe('listOwnershipWhere', () => {
  it('always ANDs both the listId and userId equality checks', () => {
    listOwnershipWhere('list_1', 'user_1')

    expect(vi.mocked(eq)).toHaveBeenCalledWith(list.id, 'list_1')
    expect(vi.mocked(eq)).toHaveBeenCalledWith(list.userId, 'user_1')
  })
})
