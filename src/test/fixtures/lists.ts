import type { ListWithItems } from '#/lib/lists/lists'
import type { ListShareData } from '#/lib/lists/get-list-by-share-token'
import { fakeMovie } from '#/test/fixtures/journal'

export const fakeListShare: ListShareData = {
  name: 'Best of the decade',
  description: 'Films worth a rewatch.',
  ownerName: 'Riley Chen',
  items: [
    {
      movie: fakeMovie,
      addedAt: new Date('2026-01-02T00:00:00Z'),
    },
  ],
}

export const fakeList: ListWithItems = {
  id: 'list_1',
  userId: 'user_1',
  name: 'Best of the decade',
  description: 'Films worth a rewatch.',
  shareToken: 'token_1',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  listItems: [
    {
      listId: 'list_1',
      movieId: fakeMovie.tmdbId,
      addedAt: new Date('2026-01-02T00:00:00Z'),
      movie: fakeMovie,
    },
  ],
}
