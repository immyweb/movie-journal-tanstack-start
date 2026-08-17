import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getJournalEntries } from '#/lib/journal/entries'
import { useListsPrototypeState } from '#/components/lists-prototype/state'
import { PrototypeSwitcher } from '#/components/lists-prototype/switcher'
import { VariantA, variantAName } from '#/components/lists-prototype/variant-a'
import { VariantB, variantBName } from '#/components/lists-prototype/variant-b'
import { VariantC, variantCName } from '#/components/lists-prototype/variant-c'

// PROTOTYPE for issue #13 — three structurally different takes on List
// creation & management (create a List, add movies via TMDB search or an
// existing JournalEntry's Movie, remove movies, delete a List), switchable
// via ?variant=. Throwaway: once a direction is picked, fold the winner
// into a real `/lists` route and drop this file plus its sibling
// components under src/components/lists-prototype/.
//
// "From your journal" results and the seed List items are drawn from the
// signed-in user's real JournalEntries (read-only) so the picker feels
// grounded; List creation/add/remove/delete stays in-memory only — no
// `list`/`list_item` tables are touched.

const searchSchema = z.object({
  variant: z.enum(['A', 'B', 'C']).catch('A'),
})

export const Route = createFileRoute('/_authed/lists-prototype')({
  validateSearch: searchSchema,
  loader: async () => {
    const entries = await getJournalEntries({ data: {} })
    const seen = new Set<string>()
    const journalMovies = []
    for (const entry of entries) {
      if (seen.has(entry.movie.tmdbId)) continue
      seen.add(entry.movie.tmdbId)
      journalMovies.push({
        tmdbId: entry.movie.tmdbId,
        title: entry.movie.title,
        releaseDate: entry.movie.releaseDate,
        posterUrl: entry.movie.posterImg,
      })
    }
    return { journalMovies }
  },
  head: () => ({
    meta: [{ title: 'Lists prototype — Movie Journal' }],
  }),
  component: ListsPrototypePage,
})

const VARIANTS = [
  { key: 'A', name: variantAName },
  { key: 'B', name: variantBName },
  { key: 'C', name: variantCName },
] as const

function ListsPrototypePage() {
  const { journalMovies } = Route.useLoaderData()
  const { variant } = Route.useSearch()
  const navigate = Route.useNavigate()
  const state = useListsPrototypeState(journalMovies)

  function setVariant(key: string) {
    navigate({
      search: { variant: key as 'A' | 'B' | 'C' },
      replace: true,
    })
  }

  const totalItems = state.lists.reduce((sum, l) => sum + l.items.length, 0)

  return (
    <>
      {variant === 'A' && (
        <VariantA state={state} journalMovies={journalMovies} />
      )}
      {variant === 'B' && (
        <VariantB state={state} journalMovies={journalMovies} />
      )}
      {variant === 'C' && (
        <VariantC state={state} journalMovies={journalMovies} />
      )}
      <PrototypeSwitcher
        variants={VARIANTS}
        current={variant}
        onChange={setVariant}
        stateSummary={`lists: ${state.lists.length} · films: ${totalItems}`}
      />
    </>
  )
}
