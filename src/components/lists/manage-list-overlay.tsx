import { useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

import { formatReleaseYear } from '#/lib/format-release-year'
import { cn } from '#/lib/utils'
import type { ListWithItems } from '#/lib/lists/lists'
import { addListItem } from '#/lib/lists/add-list-item'
import { removeListItem } from '#/lib/lists/remove-list-item'
import { deleteList } from '#/lib/lists/delete-list'
import { useMoviePicker } from '#/lib/lists/use-movie-picker'
import { useRefreshList } from '#/lib/lists/use-refresh-list'
import type { MovieSearchResult } from '#/lib/tmdb/search'
import { AuthField } from '#/components/auth-field'
import { ErrorBanner } from '#/components/error-banner'
import { OverlayShell } from '#/components/lists/overlay-shell'
import { PosterThumbnail } from '#/components/lists/poster-thumbnail'

// The full-screen management view for one List: an underline-tab, one-
// source-at-a-time picker for adding films (TMDB search or the user's own
// journal), a remove-per-item grid, and a delete-this-list action behind a
// confirm step (issue #16's card-hub + overlay UI).
export function ManageListOverlay({
  list,
  journalMovies,
  onClose,
  onDeleted,
  onListUpdated,
}: {
  list: ListWithItems
  journalMovies: Array<MovieSearchResult>
  onClose: () => void
  onDeleted: () => void
  onListUpdated: (list: ListWithItems) => void
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Blocks starting a second add/remove while one is still in flight — its
  // getLists() refresh (issue #21, finding 7) can resolve out of order with
  // a second one's, letting an older response's onListUpdated overwrite a
  // newer one's listOverrides entry. One mutation at a time sidesteps that
  // rather than reconciling out-of-order responses.
  const [isMutatingItem, setIsMutatingItem] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const picker = useMoviePicker(journalMovies)
  const alreadyAdded = useMemo(
    () => new Set(list.listItems.map((item) => item.movieId)),
    [list.listItems],
  )

  // A mutation's refresh failing must not be worded as "the mutation
  // failed" — the write went through. But it does leave the on-screen list
  // and `alreadyAdded` stale, so that's surfaced as its own message rather
  // than swallowed silently (issue #20, finding 2). Scoped to re-fetching
  // just this List via getLists(), not a full router.invalidate() of the
  // /lists route — that would also rerun getJournalEntries, even though
  // add/remove never touch journal data (issue #21, finding 7).
  const refreshList = useRefreshList(list.id)

  const applyRefresh = (result: Awaited<ReturnType<typeof refreshList>>) => {
    if (result.status === 'fresh') {
      onListUpdated(result.list)
    } else if (result.status === 'gone') {
      // The refetch succeeded but this List is no longer in it — treat the
      // same as this tab having deleted it itself.
      onDeleted()
    } else {
      setMutationError(
        'Saved, but the list on screen may be out of date. Refresh to see the latest.',
      )
    }
  }

  const handleAdd = async (movie: MovieSearchResult) => {
    setMutationError(null)
    setIsMutatingItem(true)

    try {
      await addListItem({ data: { listId: list.id, tmdbId: movie.tmdbId } })
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : 'Something went wrong adding this film. Please try again.',
      )
      setIsMutatingItem(false)
      return
    }

    applyRefresh(await refreshList())
    setIsMutatingItem(false)
  }

  const handleRemove = async (tmdbId: string) => {
    setMutationError(null)
    setIsMutatingItem(true)

    try {
      await removeListItem({ data: { listId: list.id, tmdbId } })
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : 'Something went wrong removing this film. Please try again.',
      )
      setIsMutatingItem(false)
      return
    }

    applyRefresh(await refreshList())
    setIsMutatingItem(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setMutationError(null)

    try {
      await deleteList({ data: { listId: list.id } })
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : 'Something went wrong deleting this list. Please try again.',
      )
      setIsDeleting(false)
      return
    }

    // No refresh call here — onDeleted unmounts this overlay immediately
    // and the parent hides the deleted list from its grid regardless, so
    // there's no on-screen state left for a refresh to keep in sync.
    onDeleted()
  }

  return (
    <OverlayShell title={list.name} onClose={onClose}>
      <div className="flex items-start justify-between gap-4 pr-8">
        <div>
          <h2 className="text-[1.3rem] font-extrabold">{list.name}</h2>
          {list.description && (
            <p className="text-lm-mist mt-1 text-[13.5px]">
              {list.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="text-lm-mist hover:text-lm-red flex shrink-0 cursor-pointer items-center gap-1.5 text-[12.5px] font-bold"
        >
          <Trash2 aria-hidden="true" size={14} />
          Delete list
        </button>
      </div>

      {confirmingDelete && (
        <div className="border-lm-red/40 bg-lm-red/10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <p className="text-lm-red text-sm">
            Delete &ldquo;{list.name}&rdquo;? This can&rsquo;t be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-lm-red cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? 'Deleting…' : 'Delete list'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-lm-mist hover:text-lm-paper cursor-pointer px-2 text-[13px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="mt-4">
          <ErrorBanner>{mutationError}</ErrorBanner>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-3 flex border-b border-[#33344294]">
          <button
            type="button"
            onClick={() => picker.setSource('tmdb')}
            className={cn(
              'font-lm-mono flex-1 cursor-pointer border-b-2 py-2.5 text-[11.5px] font-bold tracking-[0.06em] uppercase',
              picker.source === 'tmdb'
                ? 'border-lm-amber text-lm-amber'
                : 'text-lm-mist hover:text-lm-paper border-transparent',
            )}
          >
            Search TMDB
          </button>
          <button
            type="button"
            onClick={() => picker.setSource('journal')}
            className={cn(
              'font-lm-mono flex-1 cursor-pointer border-b-2 py-2.5 text-[11.5px] font-bold tracking-[0.06em] uppercase',
              picker.source === 'journal'
                ? 'border-lm-amber text-lm-amber'
                : 'text-lm-mist hover:text-lm-paper border-transparent',
            )}
          >
            From your journal
          </button>
        </div>

        <AuthField
          id="add-movie"
          label={
            picker.source === 'tmdb' ? 'Search TMDB' : 'Search your journal'
          }
          type="search"
          placeholder="Try “The Matrix”"
          value={picker.query}
          onChange={(event) => picker.setQuery(event.target.value)}
        />
        {picker.searchError && (
          <div className="mt-2">
            <ErrorBanner>{picker.searchError}</ErrorBanner>
          </div>
        )}
        {picker.isSearching && (
          <p className="text-lm-mist font-lm-mono mt-2 text-[11px] tracking-[0.06em] uppercase">
            Searching…
          </p>
        )}

        {picker.results.length > 0 && (
          <ul className="mt-3 max-h-[360px] space-y-1.5 overflow-y-auto">
            {picker.results.map((movie) => {
              const added = alreadyAdded.has(movie.tmdbId)
              return (
                <li key={movie.tmdbId}>
                  <button
                    type="button"
                    disabled={added || isMutatingItem}
                    onClick={() => handleAdd(movie)}
                    className="hover:bg-lm-surface focus-visible:outline-lm-amber flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left outline-none focus-visible:outline-2 disabled:cursor-default disabled:opacity-40"
                  >
                    <PosterThumbnail
                      posterUrl={movie.posterUrl}
                      alt=""
                      iconSize={20}
                      className="bg-lm-surface size-14 shrink-0 rounded-md"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[16px] font-bold">
                        {movie.title}
                      </span>
                      <span className="text-lm-mist block text-[13.5px]">
                        {added
                          ? 'Already in list'
                          : formatReleaseYear(movie.releaseDate)}
                      </span>
                    </span>
                    {!added && <Plus aria-hidden="true" size={18} />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <div className="text-lm-amber font-lm-mono mb-3 text-xs font-bold tracking-[0.14em] uppercase">
          In this list ({list.listItems.length})
        </div>
        {list.listItems.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2.5">
            {list.listItems.map((item) => (
              <div
                key={item.movieId}
                className="border-lm-line bg-lm-surface group relative overflow-hidden rounded-lg border"
              >
                <PosterThumbnail
                  posterUrl={item.movie.posterImg}
                  alt=""
                  iconSize={20}
                  className="bg-lm-surface aspect-[2/3] w-full"
                />
                <button
                  type="button"
                  disabled={isMutatingItem}
                  onClick={() => handleRemove(item.movieId)}
                  aria-label={`Remove ${item.movie.title}`}
                  className="bg-lm-ink/85 hover:bg-lm-red focus-visible:outline-lm-amber absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full text-white outline-none focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X aria-hidden="true" size={11} />
                </button>
                <div className="px-2 py-1.5 text-[11.5px] leading-tight font-bold">
                  <span className="line-clamp-2">{item.movie.title}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lm-mist text-sm">
            Nothing here yet — search above to add a film.
          </p>
        )}
      </div>
    </OverlayShell>
  )
}
