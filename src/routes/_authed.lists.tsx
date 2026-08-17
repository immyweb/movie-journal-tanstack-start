import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { getJournalEntries } from '#/lib/journal/entries'
import { getLists } from '#/lib/lists/lists'
import type { MovieSearchResult } from '#/lib/tmdb/search'
import { EmptyStateCard } from '#/components/empty-state-card'
import { ListCard } from '#/components/lists/list-card'
import { CreateListOverlay } from '#/components/lists/create-list-overlay'
import { ManageListOverlay } from '#/components/lists/manage-list-overlay'

// A signed-in user's card-hub landing page for Lists, plus the full-screen
// overlays for creating and managing one (issue #16). "From your journal"
// picker results are drawn from the user's own logged films, deduped to one
// entry per Movie since a Movie can appear on a List at most once regardless
// of how many times it's been rewatched.
export const Route = createFileRoute('/_authed/lists')({
  loader: async () => {
    const [lists, entries] = await Promise.all([
      getLists(),
      getJournalEntries({ data: {} }),
    ])

    const seen = new Set<string>()
    const journalMovies: Array<MovieSearchResult> = []
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

    return { lists, journalMovies }
  },
  head: () => ({
    meta: [{ title: 'Your lists — Movie Journal' }],
  }),
  component: ListsPage,
})

function ListsPage() {
  const { lists, journalMovies } = Route.useLoaderData()
  const [openId, setOpenId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const open = lists.find((list) => list.id === openId) ?? null

  return (
    <section className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-8 flex items-end justify-between">
          <h1 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-black">
            Your lists
          </h1>
        </div>

        {lists.length === 0 ? (
          <EmptyStateCard
            icon={Plus}
            heading={
              <h2 className="text-[1.3rem] font-extrabold">No lists yet</h2>
            }
            action={
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="bg-lm-amber cursor-pointer rounded-md px-6 py-3 text-[14px] font-bold text-[#1c1408]"
              >
                Create a list
              </button>
            }
          >
            Group films around a theme, then share the link with anyone.
          </EmptyStateCard>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onOpen={() => setOpenId(list.id)}
              />
            ))}

            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="border-lm-line text-lm-mist hover:border-lm-amber hover:text-lm-amber focus-visible:outline-lm-amber flex min-h-[176px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed outline-none focus-visible:outline-2"
            >
              <Plus aria-hidden="true" size={20} />
              <span className="text-[13.5px] font-bold">New list</span>
            </button>
          </div>
        )}
      </div>

      {isCreating && (
        <CreateListOverlay
          onCancel={() => setIsCreating(false)}
          onCreated={(listId) => {
            setIsCreating(false)
            setOpenId(listId)
          }}
        />
      )}

      {open && (
        <ManageListOverlay
          list={open}
          journalMovies={journalMovies}
          onClose={() => setOpenId(null)}
          onDeleted={() => setOpenId(null)}
        />
      )}
    </section>
  )
}
