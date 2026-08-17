import { Heart, SearchX, Ticket } from 'lucide-react'

import { EmptyStateCard } from '#/components/empty-state-card'
import { JournalFilterBar } from '#/components/journal/filter-bar'
import { Stars } from '#/components/stars'
import { cn } from '#/lib/utils'
import { formatReleaseYear } from '#/lib/format-release-year'
import { formatDateWatched } from '#/lib/format-date-watched'
import type { JournalSearch } from '#/lib/journal/search-params'
import type { PublicJournalPrototypeData } from '#/lib/journal-public-prototype/get-public-journal'

export const variantCName = 'Diary rows'

// PROTOTYPE for issue #14. Keeps the full filter bar exactly as-is (same
// as Variant A) but swaps the card grid for a dense, one-row-per-entry
// diary list — tests whether filter/sort parity and item-display style
// are actually independent decisions.
export function VariantC({
  data,
  search,
  onFilterChange,
}: {
  data: PublicJournalPrototypeData
  search: JournalSearch
  onFilterChange: <K extends keyof JournalSearch>(
    field: K,
    value: JournalSearch[K],
  ) => void
}) {
  const { entries, genreOptions, decadeOptions, stats } = data
  const hasEntries = stats.totalCount > 0

  return (
    <section className="mx-auto max-w-[880px] px-6 py-14">
      <div className="mb-8">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Public journal
        </div>
        <h1 className="mt-2.5 mb-2 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.1] font-black tracking-[-0.01em]">
          {data.ownerName}&rsquo;s journal
        </h1>
        {hasEntries && (
          <p className="text-lm-mist text-[14.5px]">
            {stats.totalCount} film{stats.totalCount === 1 ? '' : 's'} ·{' '}
            {stats.likedCount} liked ·{' '}
            {stats.avgRating !== null
              ? `${stats.avgRating.toFixed(1)}★ average`
              : 'no ratings yet'}
          </p>
        )}
      </div>

      {hasEntries ? (
        <>
          <div className="mb-6">
            <JournalFilterBar
              liked={search.liked}
              minRating={search.minRating}
              genre={search.genre}
              genreOptions={genreOptions}
              decade={search.decade}
              decadeOptions={decadeOptions}
              sort={search.sort}
              resultsCount={entries.length}
              onLikedChange={(liked) => onFilterChange('liked', liked)}
              onMinRatingChange={(minRating) =>
                onFilterChange('minRating', minRating)
              }
              onGenreChange={(genre) => onFilterChange('genre', genre)}
              onDecadeChange={(decade) => onFilterChange('decade', decade)}
              onSortChange={(sort) => onFilterChange('sort', sort)}
            />
          </div>

          {entries.length > 0 ? (
            <div className="border-lm-line divide-lm-line divide-y rounded-xl border">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div className="bg-lm-surface h-14 w-10 shrink-0 overflow-hidden rounded">
                    {entry.movie.posterImg && (
                      <img
                        src={entry.movie.posterImg}
                        alt={`${entry.movie.title} poster`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate text-[14.5px] font-bold">
                        {entry.movie.title}
                      </span>
                      <span className="text-lm-mist text-[12px]">
                        {formatReleaseYear(entry.movie.releaseDate)}
                      </span>
                    </div>
                    {entry.review && (
                      <p className="text-lm-mist mt-0.5 truncate text-[12.5px] italic">
                        &ldquo;{entry.review}&rdquo;
                      </p>
                    )}
                  </div>
                  <Heart
                    aria-label={entry.like ? 'Liked' : undefined}
                    aria-hidden={!entry.like}
                    size={14}
                    className={cn(
                      'shrink-0',
                      entry.like ? 'fill-current text-[#e77b90]' : 'invisible',
                    )}
                  />
                  <Stars rating={entry.rating} />
                  <span className="font-lm-mono text-lm-mist w-[92px] shrink-0 text-right text-[10.5px] tracking-[0.04em]">
                    {formatDateWatched(entry.dateWatched)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              icon={SearchX}
              heading={
                <h3 className="text-[1.3rem] font-extrabold">
                  No matches for these filters
                </h3>
              }
            >
              Nothing matches the current filters. Try clearing them.
            </EmptyStateCard>
          )}
        </>
      ) : (
        <EmptyStateCard
          icon={Ticket}
          heading={
            <h2 className="text-[1.3rem] font-extrabold">No stubs yet</h2>
          }
        >
          {data.ownerName} hasn&rsquo;t logged a film yet.
        </EmptyStateCard>
      )}
    </section>
  )
}
