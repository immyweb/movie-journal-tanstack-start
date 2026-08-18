import { describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'

import { db } from '#/lib/db'
import { loadJournalPageDataForUser } from '#/lib/journal/page-data'
import {
  loadPublicJournal,
  resolvePublicJournalOwner,
} from '#/lib/journal/get-public-journal'

vi.mock('#/lib/db', () => ({
  db: { query: { user: { findFirst: vi.fn() } } },
}))

vi.mock('#/lib/journal/page-data', () => ({
  loadJournalPageDataForUser: vi.fn(),
}))

// Wraps the real `eq` so the lookup's actual comparison value is
// inspectable — asserting on Drizzle's own SQL fragment internals would be
// fragile, but capturing what gets passed *into* `eq` isn't.
vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>()
  return { ...actual, eq: vi.fn(actual.eq) }
})

describe('resolvePublicJournalOwner', () => {
  it('returns null for an unknown username', () => {
    expect(resolvePublicJournalOwner(undefined)).toBeNull()
  })

  it('returns null for a known username with journalIsPublic: false', () => {
    expect(
      resolvePublicJournalOwner({
        id: 'user_1',
        name: 'Riley Chen',
        journalIsPublic: false,
      }),
    ).toBeNull()
  })

  it('returns the owner for a known username with journalIsPublic: true', () => {
    expect(
      resolvePublicJournalOwner({
        id: 'user_1',
        name: 'Riley Chen',
        journalIsPublic: true,
      }),
    ).toEqual({ id: 'user_1', name: 'Riley Chen' })
  })
})

// Covers the actual privacy gate end-to-end (username lookup ->
// journalIsPublic check -> data fetch), not just the pure
// resolvePublicJournalOwner helper in isolation — a future edit that
// reorders or drops the check here would fail these.
describe('loadPublicJournal', () => {
  const search = { sort: 'most-recently-watched' } as const

  it('returns null for an unknown username, never reaching loadJournalPageDataForUser', async () => {
    vi.mocked(db.query.user.findFirst).mockResolvedValue(undefined as never)

    const result = await loadPublicJournal('nobody', search)

    expect(result).toBeNull()
    expect(loadJournalPageDataForUser).not.toHaveBeenCalled()
  })

  it('returns null for a known username with journalIsPublic: false, never reaching loadJournalPageDataForUser', async () => {
    vi.mocked(db.query.user.findFirst).mockResolvedValue({
      id: 'user_1',
      name: 'Riley Chen',
      journalIsPublic: false,
    } as never)

    const result = await loadPublicJournal('rileychen', search)

    expect(result).toBeNull()
    expect(loadJournalPageDataForUser).not.toHaveBeenCalled()
  })

  it('returns owner-attributed page data for a known, public username', async () => {
    vi.mocked(db.query.user.findFirst).mockResolvedValue({
      id: 'user_1',
      name: 'Riley Chen',
      journalIsPublic: true,
    } as never)
    vi.mocked(loadJournalPageDataForUser).mockResolvedValue({
      entries: [],
      genreOptions: [],
      decadeOptions: [],
      stats: {
        totalCount: 0,
        watchedThisYear: 0,
        likedCount: 0,
        avgRating: null,
      },
    } as never)

    const result = await loadPublicJournal('rileychen', search)

    expect(result).toMatchObject({ ownerName: 'Riley Chen' })
    expect(loadJournalPageDataForUser).toHaveBeenCalledWith('user_1', search)
  })

  it('normalizes the username to trimmed lowercase before looking it up', async () => {
    vi.mocked(db.query.user.findFirst).mockResolvedValue(undefined as never)

    await loadPublicJournal('  RileyChen  ', search)

    expect(vi.mocked(eq)).toHaveBeenCalledWith(expect.anything(), 'rileychen')
  })
})
