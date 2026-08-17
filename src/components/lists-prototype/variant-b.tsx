import { useState } from 'react'
import { Film, Plus, Ticket } from 'lucide-react'

import { formatReleaseYear } from '#/lib/format-release-year'
import { cn } from '#/lib/utils'
import { AuthField } from '#/components/auth-field'
import { TextareaField } from '#/components/textarea-field'
import { ErrorBanner } from '#/components/error-banner'
import { EmptyStateCard } from '#/components/empty-state-card'
import { ticketButtonClass } from '#/components/ticket-button'
import { useMoviePicker } from '#/components/lists-prototype/use-movie-picker'
import type {
  ListsPrototypeState,
  PickerMovie,
} from '#/components/lists-prototype/state'

export const variantBName = 'Linear wizard'

// B — one column, mirrors the /journal/new flow's ticket-machine feel.
// Primary affordance: a chip strip switches which List is "in the
// machine," and everything below — add, view, delete — happens as
// sequential sections on one page, not a split view. Items render as
// compact rows, not a card grid, and deleting is a typed-confirm step at
// the bottom rather than an inline banner.
export function VariantB({
  state,
  journalMovies,
}: {
  state: ListsPrototypeState
  journalMovies: Array<PickerMovie>
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    state.lists[0]?.id ?? null,
  )
  const [isCreating, setIsCreating] = useState(state.lists.length === 0)

  const selected = state.lists.find((list) => list.id === selectedId) ?? null

  return (
    <section className="px-6 pt-6 pb-16">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {state.lists.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => {
                setSelectedId(list.id)
                setIsCreating(false)
              }}
              className={cn(
                'font-lm-mono cursor-pointer rounded-full border px-3 py-1.5 text-[11.5px] font-bold tracking-[0.04em]',
                list.id === selectedId && !isCreating
                  ? 'border-lm-amber bg-lm-amber/12 text-lm-amber'
                  : 'border-lm-line text-lm-mist hover:text-lm-paper',
              )}
            >
              {list.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className={cn(
              'flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-[11.5px] font-bold tracking-[0.04em]',
              isCreating
                ? 'border-lm-amber bg-lm-amber/12 text-lm-amber'
                : 'border-lm-line border-dashed text-lm-mist hover:text-lm-paper',
            )}
          >
            <Plus aria-hidden="true" size={12} />
            New list
          </button>
        </div>

        {isCreating ? (
          <CreateListStep
            onCreate={(name, description) => {
              const id = state.createList(name, description)
              setSelectedId(id)
              setIsCreating(false)
            }}
          />
        ) : selected ? (
          <ManageListStep
            key={selected.id}
            list={selected}
            journalMovies={journalMovies}
            onAdd={(movie) => state.addMovie(selected.id, movie)}
            onRemove={(tmdbId) => state.removeMovie(selected.id, tmdbId)}
            onDelete={() => {
              state.deleteList(selected.id)
              setSelectedId(null)
              setIsCreating(true)
            }}
          />
        ) : (
          <EmptyStateCard
            icon={Ticket}
            heading={
              <h2 className="text-[1.3rem] font-extrabold">No lists yet</h2>
            }
            action={
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className={cn(ticketButtonClass, 'mt-2')}
              >
                Start your first list
              </button>
            }
          >
            Give it a name and start adding films.
          </EmptyStateCard>
        )}
      </div>
    </section>
  )
}

function CreateListStep({
  onCreate,
}: {
  onCreate: (name: string, description: string | null) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <div>
      <div className="pb-8 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          New list
        </div>
        <h1 className="mt-2.5 mb-[14px] text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          Name your list
        </h1>
        <p className="text-lm-mist mx-auto max-w-[440px] text-[1rem] leading-[1.6]">
          You&rsquo;ll add films to it on the next step.
        </p>
      </div>

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
          id="wizard-list-name"
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sunday morning rewatches"
        />
        <TextareaField
          id="wizard-list-description"
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What ties these films together?"
        />
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <button type="submit" className={cn(ticketButtonClass, 'w-full')}>
          Create list
        </button>
      </form>
    </div>
  )
}

function ManageListStep({
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
  const picker = useMoviePicker(journalMovies)
  const alreadyAdded = new Set(list.items.map((item) => item.movie.tmdbId))

  return (
    <div>
      <div className="pb-8 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Managing list
        </div>
        <h1 className="mt-2.5 mb-[14px] text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          {list.name}
        </h1>
        <p className="text-lm-mist mx-auto max-w-[440px] text-[1rem] leading-[1.6]">
          {list.description ??
            `${list.items.length} film${list.items.length === 1 ? '' : 's'} so far.`}
        </p>
      </div>

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
        id="wizard-add-movie"
        label={picker.source === 'tmdb' ? 'Search TMDB' : 'Search your journal'}
        type="search"
        placeholder="Try “The Matrix”"
        value={picker.query}
        onChange={(event) => picker.setQuery(event.target.value)}
      />

      {picker.searchError && (
        <div className="mt-3">
          <ErrorBanner>{picker.searchError}</ErrorBanner>
        </div>
      )}
      {picker.isSearching && (
        <p className="text-lm-mist font-lm-mono mt-3 text-xs tracking-[0.08em] uppercase">
          Searching…
        </p>
      )}

      {picker.results.length > 0 && (
        <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
          {picker.results.map((movie) => {
            const added = alreadyAdded.has(movie.tmdbId)
            return (
              <button
                key={movie.tmdbId}
                type="button"
                disabled={added}
                onClick={() => onAdd(movie)}
                className="border-lm-line bg-lm-surface hover:border-lm-amber focus-visible:outline-lm-amber flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left outline-none transition-colors focus-visible:outline-2 disabled:cursor-default disabled:opacity-40"
              >
                <div className="bg-lm-surface aspect-[2/3] w-full">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt=""
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-lm-mist flex h-full w-full items-center justify-center">
                      <Film aria-hidden="true" size={24} />
                    </div>
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <div className="line-clamp-2 text-[12px] leading-tight font-bold">
                    {movie.title}
                  </div>
                  <div className="text-lm-mist text-[11px]">
                    {added
                      ? 'Already in list'
                      : formatReleaseYear(movie.releaseDate)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-10">
        <div className="text-lm-amber font-lm-mono mb-3 text-xs font-bold tracking-[0.14em] uppercase">
          In this list ({list.items.length})
        </div>
        {list.items.length > 0 ? (
          <ul className="divide-lm-line border-lm-line divide-y rounded-lg border">
            {list.items.map((item) => (
              <li
                key={item.movie.tmdbId}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <span className="bg-lm-surface flex size-10 shrink-0 items-center justify-center overflow-hidden rounded">
                  {item.movie.posterUrl ? (
                    <img
                      src={item.movie.posterUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Film aria-hidden="true" size={16} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold">
                    {item.movie.title}
                  </div>
                  <div className="text-lm-mist text-xs">
                    {formatReleaseYear(item.movie.releaseDate)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.movie.tmdbId)}
                  className="text-lm-mist hover:text-lm-red focus-visible:outline-lm-amber cursor-pointer text-[12.5px] font-bold outline-none focus-visible:outline-2"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-lm-mist text-sm">
            Nothing here yet — search above to add a film.
          </p>
        )}
      </div>

      <DangerZone listName={list.name} onDelete={onDelete} />
    </div>
  )
}

function DangerZone({
  listName,
  onDelete,
}: {
  listName: string
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  return (
    <div className="border-lm-line mt-12 border-t pt-6">
      {expanded ? (
        <div className="border-lm-red/40 bg-lm-red/10 space-y-3 rounded-lg border p-4">
          <p className="text-lm-red text-sm">
            This deletes &ldquo;{listName}&rdquo; and every film on it. Type the
            list name to confirm.
          </p>
          <AuthField
            id="confirm-delete-list"
            label="List name"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder={listName}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={confirmText.trim() !== listName}
              onClick={onDelete}
              className="bg-lm-red cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete list
            </button>
            <button
              type="button"
              onClick={() => {
                setExpanded(false)
                setConfirmText('')
              }}
              className="text-lm-mist hover:text-lm-paper cursor-pointer px-2 text-[13px]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-lm-mist hover:text-lm-red cursor-pointer text-[13px] underline underline-offset-2"
        >
          Delete this list
        </button>
      )}
    </div>
  )
}
