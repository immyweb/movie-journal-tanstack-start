import { Ticket } from 'lucide-react'

import { EmptyStateCard } from '#/components/empty-state-card'
import { Stars } from '#/components/stars'
import { cn } from '#/lib/utils'
import { formatReleaseYear } from '#/lib/format-release-year'
import { formatDateWatched, toDate } from '#/lib/format-date-watched'
import type { JournalSearch } from '#/lib/journal/search-params'
import type { PublicJournalPrototypeData } from '#/lib/journal-public-prototype/get-public-journal'

export const variantBName = 'Timeline'

// PROTOTYPE for issue #14. Drops the filter bar entirely — the opposite
// end of the "how much do we reuse" spectrum from Variant A — and groups
// entries into year sections instead, framed as a browsable timeline of a
// person's viewing history rather than a faceted database view. Only a
// recent/oldest toggle survives from the real sort controls.
export function VariantB({
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
  const { entries, stats } = data
  const hasEntries = stats.totalCount > 0
  const isOldestFirst = search.sort === 'earliest-watched'

  const groups = new Map<number, typeof entries>()
  for (const entry of entries) {
    const year = toDate(entry.dateWatched).getUTCFullYear()
    const group = groups.get(year) ?? []
    group.push(entry)
    groups.set(year, group)
  }

  return (
    <>
      <section className="border-lm-line border-b px-6 py-14 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Public journal
        </div>
        <h1 className="mt-2.5 mb-3 text-[clamp(2rem,5vw,3.2rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          {data.ownerName}
        </h1>
        <p className="text-lm-mist mx-auto max-w-[480px] text-[1rem] leading-[1.6]">
          {hasEntries
            ? `${stats.totalCount} film${stats.totalCount === 1 ? '' : 's'} watched, ${stats.likedCount} liked.`
            : `Hasn't logged a film yet.`}
        </p>

        {hasEntries && (
          <div className="border-lm-line bg-lm-mist/10 mx-auto mt-7 inline-flex rounded-full border p-1 text-xs font-bold tracking-[0.03em] uppercase">
            <button
              type="button"
              onClick={() => onFilterChange('sort', 'most-recently-watched')}
              className={cn(
                'rounded-full px-4 py-1.5 transition-colors',
                !isOldestFirst ? 'bg-lm-amber text-[#1c1408]' : 'text-lm-mist',
              )}
            >
              Recent first
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('sort', 'earliest-watched')}
              className={cn(
                'rounded-full px-4 py-1.5 transition-colors',
                isOldestFirst ? 'bg-lm-amber text-[#1c1408]' : 'text-lm-mist',
              )}
            >
              Oldest first
            </button>
          </div>
        )}
      </section>

      {hasEntries ? (
        <div className="mx-auto max-w-[760px] px-6 py-14">
          {Array.from(groups.entries()).map(([year, yearEntries]) => (
            <div key={year} className="mb-12 last:mb-0">
              <div className="border-lm-line mb-5 flex items-center gap-4 border-b pb-2.5">
                <h2 className="font-lm-mono text-lm-amber text-xl font-bold tabular-nums">
                  {year}
                </h2>
                <span className="text-lm-mist text-xs">
                  {yearEntries.length} film{yearEntries.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                {yearEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4">
                    <div className="bg-lm-surface h-[84px] w-14 shrink-0 overflow-hidden rounded-md">
                      {entry.movie.posterImg && (
                        <img
                          src={entry.movie.posterImg}
                          alt={`${entry.movie.title} poster`}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <span className="text-[15px] font-extrabold">
                          {entry.movie.title}
                        </span>
                        <span className="text-lm-mist text-[12.5px]">
                          {formatReleaseYear(entry.movie.releaseDate)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <Stars rating={entry.rating} />
                        <span className="font-lm-mono text-lm-mist text-[10.5px] tracking-[0.04em]">
                          {formatDateWatched(entry.dateWatched)}
                        </span>
                      </div>
                      {entry.review && (
                        <p className="text-lm-mist mt-1.5 line-clamp-2 text-[13px] leading-[1.5] italic">
                          &ldquo;{entry.review}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="px-6 py-16">
          <EmptyStateCard
            icon={Ticket}
            heading={
              <h2 className="text-[1.3rem] font-extrabold">No stubs yet</h2>
            }
          >
            {data.ownerName} hasn&rsquo;t logged a film yet.
          </EmptyStateCard>
        </section>
      )}
    </>
  )
}
