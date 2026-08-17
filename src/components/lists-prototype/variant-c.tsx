import { useState } from 'react'
import { Film, Plus, Trash2, X } from 'lucide-react'

import { formatReleaseYear } from '#/lib/format-release-year'
import { cn } from '#/lib/utils'
import { AuthField } from '#/components/auth-field'
import { TextareaField } from '#/components/textarea-field'
import { ErrorBanner } from '#/components/error-banner'
import { EmptyStateCard } from '#/components/empty-state-card'
import { useMoviePicker } from '#/components/lists-prototype/use-movie-picker'
import type {
  ListsPrototypeState,
  PickerMovie,
} from '#/components/lists-prototype/state'

export const variantCName = 'Card hub + overlay'

// C — a grid of List cards is the whole page; management happens in a
// full-screen overlay rather than inline or in a side panel. Post-review:
// the overlay's add-movie picker was reworked to B's underline-tab, one-
// source-at-a-time pattern (issue #13's chosen combination) — dropped the
// original two-permanent-columns layout.
export function VariantC({
  state,
  journalMovies,
}: {
  state: ListsPrototypeState
  journalMovies: Array<PickerMovie>
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const open = state.lists.find((list) => list.id === openId) ?? null

  return (
    <section className="px-6 pt-10 pb-16">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-8 flex items-end justify-between">
          <h1 className="text-[clamp(1.6rem,3.5vw,2.2rem)] font-black">
            Your lists
          </h1>
        </div>

        {state.lists.length === 0 && !isCreating ? (
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
            Group films into a named collection you can share.
          </EmptyStateCard>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {state.lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => setOpenId(list.id)}
                className="border-lm-line bg-lm-surface hover:border-lm-amber focus-visible:outline-lm-amber flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left outline-none transition-colors focus-visible:outline-2"
              >
                <div className="flex -space-x-4">
                  {list.items.length > 0 ? (
                    list.items.slice(0, 3).map((item) => (
                      <span
                        key={item.movie.tmdbId}
                        className="bg-lm-ink border-lm-surface aspect-[2/3] w-14 shrink-0 overflow-hidden rounded border-2"
                      >
                        {item.movie.posterUrl ? (
                          <img
                            src={item.movie.posterUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lm-mist flex h-full w-full items-center justify-center">
                            <Film aria-hidden="true" size={16} />
                          </span>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="border-lm-line text-lm-mist flex aspect-[2/3] w-14 items-center justify-center rounded border border-dashed">
                      <Film aria-hidden="true" size={16} />
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-[15px] font-extrabold">{list.name}</div>
                  {list.description && (
                    <div className="text-lm-mist mt-0.5 line-clamp-2 text-[13px]">
                      {list.description}
                    </div>
                  )}
                  <div className="text-lm-mist font-lm-mono mt-1.5 text-[10.5px] font-bold tracking-[0.06em] uppercase">
                    {list.items.length} film{list.items.length === 1 ? '' : 's'}
                  </div>
                </div>
              </button>
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
          onCreate={(name, description) => {
            const id = state.createList(name, description)
            setIsCreating(false)
            setOpenId(id)
          }}
        />
      )}

      {open && (
        <ManageOverlay
          list={open}
          journalMovies={journalMovies}
          onClose={() => setOpenId(null)}
          onAdd={(movie) => state.addMovie(open.id, movie)}
          onRemove={(tmdbId) => state.removeMovie(open.id, tmdbId)}
          onDelete={() => {
            state.deleteList(open.id)
            setOpenId(null)
          }}
        />
      )}
    </section>
  )
}

function OverlayShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6">
      <div className="bg-lm-ink border-lm-line relative max-h-[85vh] w-full max-w-[720px] overflow-y-auto rounded-2xl border p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-lm-mist hover:text-lm-paper focus-visible:outline-lm-amber absolute top-4 right-4 cursor-pointer outline-none focus-visible:outline-2"
        >
          <X aria-hidden="true" size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

function CreateListOverlay({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, description: string | null) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <OverlayShell onClose={onCancel}>
      <h2 className="mb-5 text-[1.3rem] font-extrabold">New list</h2>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) {
            setError('Give your list a name.')
            return
          }
          onCreate(name.trim(), description.trim() ? description.trim() : null)
        }}
      >
        <AuthField
          id="overlay-list-name"
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sunday morning rewatches"
        />
        <TextareaField
          id="overlay-list-description"
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What ties these films together?"
        />
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <button
          type="submit"
          className="bg-lm-amber w-full cursor-pointer rounded-md py-3 text-[14px] font-bold text-[#1c1408]"
        >
          Create list
        </button>
      </form>
    </OverlayShell>
  )
}

function ManageOverlay({
  list,
  journalMovies,
  onClose,
  onAdd,
  onRemove,
  onDelete,
}: {
  list: ListsPrototypeState['lists'][number]
  journalMovies: Array<PickerMovie>
  onClose: () => void
  onAdd: (movie: PickerMovie) => void
  onRemove: (tmdbId: string) => void
  onDelete: () => void
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const picker = useMoviePicker(journalMovies)
  const alreadyAdded = new Set(list.items.map((item) => item.movie.tmdbId))

  return (
    <OverlayShell onClose={onClose}>
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
              onClick={onDelete}
              className="bg-lm-red cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-bold text-white"
            >
              Delete list
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
          id="overlay-add-movie"
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
          <ul className="mt-2 max-h-[240px] space-y-1 overflow-y-auto">
            {picker.results.map((movie) => {
              const added = alreadyAdded.has(movie.tmdbId)
              return (
                <li key={movie.tmdbId}>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => onAdd(movie)}
                    className="hover:bg-lm-surface focus-visible:outline-lm-amber flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left outline-none focus-visible:outline-2 disabled:cursor-default disabled:opacity-40"
                  >
                    <span className="bg-lm-surface flex size-8 shrink-0 items-center justify-center overflow-hidden rounded">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Film aria-hidden="true" size={13} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold">
                        {movie.title}
                      </span>
                      <span className="text-lm-mist block text-[11px]">
                        {added
                          ? 'Already in list'
                          : formatReleaseYear(movie.releaseDate)}
                      </span>
                    </span>
                    {!added && <Plus aria-hidden="true" size={14} />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <div className="text-lm-amber font-lm-mono mb-3 text-xs font-bold tracking-[0.14em] uppercase">
          In this list ({list.items.length})
        </div>
        {list.items.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2.5">
            {list.items.map((item) => (
              <div
                key={item.movie.tmdbId}
                className="border-lm-line bg-lm-surface group relative overflow-hidden rounded-lg border"
              >
                <div className="bg-lm-surface aspect-[2/3] w-full">
                  {item.movie.posterUrl ? (
                    <img
                      src={item.movie.posterUrl}
                      alt=""
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-lm-mist flex h-full w-full items-center justify-center">
                      <Film aria-hidden="true" size={20} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.movie.tmdbId)}
                  aria-label={`Remove ${item.movie.title}`}
                  className="bg-lm-ink/85 hover:bg-lm-red focus-visible:outline-lm-amber absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full text-white outline-none focus-visible:outline-2"
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
