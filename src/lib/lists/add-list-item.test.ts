import { describe, expect, it, vi } from 'vitest'
import { DrizzleQueryError } from 'drizzle-orm'

import { db } from '#/lib/db'
import { addListItemForUser } from '#/lib/lists/add-list-item'
import { fetchMovieSummary } from '#/lib/tmdb/movie-summary'

vi.mock('#/lib/db', () => ({
  db: {
    query: { list: { findFirst: vi.fn() }, movie: { findFirst: vi.fn() } },
    transaction: vi.fn(),
  },
}))

vi.mock('#/lib/tmdb/movie-summary', () => ({
  fetchMovieSummary: vi.fn(),
}))

describe('addListItemForUser', () => {
  // Issue #20 finding 5's cross-user ownership-bypass (IDOR) test — the
  // initial ownership check runs before any TMDB fetch, so a non-owner
  // never reaches it either.
  it('throws for a list owned by a different user, never fetching from TMDB', async () => {
    vi.mocked(db.query.list.findFirst).mockResolvedValue(undefined as never)

    await expect(
      addListItemForUser('attacker', { listId: 'list_1', tmdbId: 'tmdb_1' }),
    ).rejects.toThrow('This list no longer exists.')
    expect(fetchMovieSummary).not.toHaveBeenCalled()
  })

  // Issue #20 finding 5's TOCTOU race: the in-transaction ownership
  // recheck passes, but a concurrent deleteList commits before the
  // listItem insert, so the insert itself fails its FK constraint. That
  // raw postgres error is reworded as the same friendly "no longer exists"
  // message the ownership checks already use, instead of leaking verbatim.
  it('rewords a foreign-key violation from a raced deleteList as the friendly message', async () => {
    vi.mocked(db.query.list.findFirst).mockResolvedValue({
      id: 'list_1',
      userId: 'user_1',
    } as never)
    vi.mocked(db.query.movie.findFirst).mockResolvedValue({
      tmdbId: 'tmdb_1',
    } as never)
    const fkError = Object.assign(new Error('foreign key violation'), {
      code: '23503',
      constraint: 'list_item_list_id_list_id_fk',
    })
    vi.mocked(db.transaction).mockRejectedValue(
      new DrizzleQueryError('insert into "list_item" ...', [], fkError),
    )

    await expect(
      addListItemForUser('user_1', { listId: 'list_1', tmdbId: 'tmdb_1' }),
    ).rejects.toThrow('This list no longer exists.')
  })

  // The reword is scoped to listId's own FK by constraint name — a
  // violation on movieId's FK means something else entirely (the movie row
  // vanished, not the list), so it must not be mislabeled the same way.
  it('does not reword a foreign-key violation on an unrelated constraint', async () => {
    vi.mocked(db.query.list.findFirst).mockResolvedValue({
      id: 'list_1',
      userId: 'user_1',
    } as never)
    vi.mocked(db.query.movie.findFirst).mockResolvedValue({
      tmdbId: 'tmdb_1',
    } as never)
    const fkError = Object.assign(new Error('foreign key violation'), {
      code: '23503',
      constraint: 'list_item_movie_id_movie_tmdb_id_fk',
    })
    vi.mocked(db.transaction).mockRejectedValue(
      new DrizzleQueryError('insert into "list_item" ...', [], fkError),
    )

    await expect(
      addListItemForUser('user_1', { listId: 'list_1', tmdbId: 'tmdb_1' }),
    ).rejects.toMatchObject({ cause: fkError })
  })

  it('re-throws an unrelated transaction error as-is', async () => {
    vi.mocked(db.query.list.findFirst).mockResolvedValue({
      id: 'list_1',
      userId: 'user_1',
    } as never)
    vi.mocked(db.query.movie.findFirst).mockResolvedValue({
      tmdbId: 'tmdb_1',
    } as never)
    vi.mocked(db.transaction).mockRejectedValue(new Error('connection reset'))

    await expect(
      addListItemForUser('user_1', { listId: 'list_1', tmdbId: 'tmdb_1' }),
    ).rejects.toThrow('connection reset')
  })
})
