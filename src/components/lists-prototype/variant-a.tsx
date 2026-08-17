import { useState } from 'react'
import { Film, ListPlus, Plus, Trash2, X } from 'lucide-react'

import { formatReleaseYear } from '#/lib/format-release-year'
import { cn } from '#/lib/utils'
import { AuthField } from '#/components/auth-field'
import { ErrorBanner } from '#/components/error-banner'
import { EmptyStateCard } from '#/components/empty-state-card'
import { ticketButtonClass } from '#/components/ticket-button'
import { useMoviePicker } from '#/components/lists-prototype/use-movie-picker'
import type {
  ListsPrototypeState,
  PickerMovie,
} from '#/components/lists-prototype/state'

export const variantAName = 'Sidebar rail + detail'

// A — persistent left rail of every List (like a playlist sidebar); the
// right panel is the selected List's management surface. Primary
// affordance: switching between Lists without losing your place. Add-movie
// is a compact bar pinned under the detail header, tabbed by source.
export function VariantA({
  state,
  journalMovies,
}: {
  state: ListsPrototypeState
  journalMovies: Array<PickerMovie>
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    state.lists[0]?.id ?? null,
  )
  const [isCreating, setIsCreating] = useState(false)

  const selected = state.lists.find((list) => list.id === selectedId) ?? null

  return (
    <section className="px-6 pt-10 pb-16">
      <div className="mx-auto flex max-w-[1120px] items-start gap-6">
        <aside className="border-lm-line bg-lm-surface w-[260px] shrink-0 rounded-xl border p-3">
          <div className="text-lm-mist font-lm-mono px-2 pt-1 pb-3 text-[10.5px] font-bold tracking-[0.1em] uppercase">
            Your lists
          </div>
          <div className="flex flex-col gap-1">
            {state.lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => setSelectedId(list.id)}
                className={cn(
                  'focus-visible:outline-lm-amber flex flex-col rounded-lg px-3 py-2.5 text-left outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
                  list.id === selectedId
                    ? 'bg-lm-amber/12 text-lm-amber'
                    : 'hover:bg-lm-ink/60',
                )}
              >
                <span className="truncate text-[14px] font-bold">
                  {list.name}
                </span>
                <span className="text-lm-mist text-xs">
                  {list.items.length} film{list.items.length === 1 ? '' : 's'}
                </span>
              </button>
            ))}
          </div>

          {isCreating ? (
            <CreateListForm
              onCancel={() => setIsCreating(false)}
              onCreate={(name, description) => {
                const id = state.createList(name, description)
                setSelectedId(id)
                setIsCreating(false)
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="text-lm-amber hover:bg-lm-ink/60 focus-visible:outline-lm-amber mt-2 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Plus aria-hidden="true" size={15} />
              New list
            </button>
          )}
        </aside>

        <div className="min-w-0 flex-1">
          {selected ? (
            <ListDetail
              key={selected.id}
              list={selected}
              journalMovies={journalMovies}
              onAdd={(movie) => state.addMovie(selected.id, movie)}
              onRemove={(tmdbId) => state.removeMovie(selected.id, tmdbId)}
              onDelete={() => {
                state.deleteList(selected.id)
                setSelectedId(
                  state.lists.find((l) => l.id !== selected.id)?.id ?? null,
                )
              }}
            />
          ) : (
            <EmptyStateCard
              icon={ListPlus}
              heading={
                <h2 className="text-[1.3rem] font-extrabold">
                  No list selected
                </h2>
              }
              action={
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className={cn(ticketButtonClass, 'mt-2')}
                >
                  Create your first list
                </button>
              }
            >
              Pick a list from the rail, or start a new one.
            </EmptyStateCard>
          )}
        </div>
      </div>
    </section>
  )
}

// Name-only by design — the rail's create form stays a one-field inline
// popover; B and C collect a description as part of a fuller create step.
function CreateListForm({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, description: string | null) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="border-lm-line mt-2 space-y-2.5 rounded-lg border border-dashed p-2.5"
      onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) {
          setError('Give your list a name.')
          return
        }
        onCreate(name.trim(), null)
      }}
    >
      <AuthField
        id="rail-list-name"
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Sunday morning rewatches"
      />
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-lm-amber flex-1 cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-bold text-[#1c1408]"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-lm-mist hover:text-lm-paper cursor-pointer px-2 text-[13px]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function ListDetail({
  list,
  journalMovies,
  onAdd,
  onRemove,
  onDelete,
}: {
  list: ListsPrototypeState['lists'][number]
  journalMovies: Array<PickerMovie>
  onAdd: (movie: PickerMovie) => void
  onRemove: (tmdbId: string) => void
  onDelete: () => void
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const picker = useMoviePicker(journalMovies)
  const alreadyAdded = new Set(list.items.map((item) => item.movie.tmdbId))

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[1.5rem] font-extrabold">{list.name}</h2>
          {list.description && (
            <p className="text-lm-mist mt-1 text-[14px]">{list.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Delete list"
          className="border-lm-line text-lm-mist hover:border-lm-red hover:text-lm-red focus-visible:outline-lm-red flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border outline-none focus-visible:outline-2"
        >
          <Trash2 aria-hidden="true" size={16} />
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

      <div className="border-lm-line bg-lm-surface mt-6 rounded-xl border p-4">
        <div className="mb-3 flex gap-1.5">
          <button
            type="button"
            onClick={() => picker.setSource('tmdb')}
            className={cn(
              'font-lm-mono cursor-pointer rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase',
              picker.source === 'tmdb'
                ? 'bg-lm-amber text-[#1c1408]'
                : 'text-lm-mist hover:text-lm-paper',
            )}
          >
            Search TMDB
          </button>
          <button
            type="button"
            onClick={() => picker.setSource('journal')}
            className={cn(
              'font-lm-mono cursor-pointer rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase',
              picker.source === 'journal'
                ? 'bg-lm-amber text-[#1c1408]'
                : 'text-lm-mist hover:text-lm-paper',
            )}
          >
            From your journal
          </button>
        </div>
        <AuthField
          id="add-movie-search"
          label={
            picker.source === 'tmdb'
              ? 'Search TMDB'
              : 'Search films you’ve logged'
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
          <p className="text-lm-mist font-lm-mono mt-2 text-xs tracking-[0.08em] uppercase">
            Searching…
          </p>
        )}

        {picker.results.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {picker.results.map((movie) => {
              const added = alreadyAdded.has(movie.tmdbId)
              return (
                <button
                  key={movie.tmdbId}
                  type="button"
                  disabled={added}
                  onClick={() => onAdd(movie)}
                  className="border-lm-line bg-lm-ink hover:border-lm-amber focus-visible:outline-lm-amber flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-left outline-none transition-colors focus-visible:outline-2 disabled:cursor-default disabled:opacity-50"
                >
                  <span className="bg-lm-surface flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Film aria-hidden="true" size={11} />
                    )}
                  </span>
                  <span className="text-[12.5px] font-bold">{movie.title}</span>
                  {!added && <Plus aria-hidden="true" size={12} />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {list.items.length > 0 ? (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
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
                    <Film aria-hidden="true" size={28} />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.movie.tmdbId)}
                aria-label={`Remove ${item.movie.title}`}
                className="bg-lm-ink/85 hover:bg-lm-red focus-visible:outline-lm-amber absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full text-white outline-none focus-visible:outline-2"
              >
                <X aria-hidden="true" size={13} />
              </button>
              <div className="px-2.5 py-2">
                <div className="line-clamp-2 text-[13px] leading-tight font-bold">
                  {item.movie.title}
                </div>
                <div className="text-lm-mist text-xs">
                  {formatReleaseYear(item.movie.releaseDate)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyStateCard
            icon={ListPlus}
            heading={
              <h3 className="text-[1.1rem] font-extrabold">No films yet</h3>
            }
          >
            Search above to add the first film to this list.
          </EmptyStateCard>
        </div>
      )}
    </div>
  )
}
