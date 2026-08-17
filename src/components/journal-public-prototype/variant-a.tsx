import { SearchX, Ticket } from 'lucide-react'

import { Tear } from '#/components/tear-divider'
import { MovieStub } from '#/components/movie-stub'
import { EmptyStateCard } from '#/components/empty-state-card'
import { JournalFilterBar } from '#/components/journal/filter-bar'
import { formatReleaseYear } from '#/lib/format-release-year'
import { formatDateWatched } from '#/lib/format-date-watched'
import { getSortSectionLabel } from '#/lib/journal/sort'
import type { JournalSearch } from '#/lib/journal/search-params'
import type { PublicJournalPrototypeData } from '#/lib/journal-public-prototype/get-public-journal'

export const variantAName = 'Direct reuse'

function counter(value: number) {
  return String(value).padStart(3, '0')
}

// PROTOTYPE for issue #14. As close to the authenticated Journal page as
// the visitor constraint allows — same stats strip, same filter bar, same
// stub grid — to answer "how much of this can just be reused wholesale".
// Two differences from the authed page: the welcome banner becomes an
// attribution line, and stubs aren't links (no public film-detail route
// exists to send a visitor to, and there's no edit affordance to reach
// either way).
export function VariantA({
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
  const avgRatingDisplay =
    stats.avgRating !== null ? stats.avgRating.toFixed(1) : '—'

  return (
    <>
      <section className="px-6 pt-6 pb-10 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Public journal
        </div>
        <h1 className="mt-2.5 mb-[14px] text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          {data.ownerName}&rsquo;s journal
        </h1>
        <p className="text-lm-mist mx-auto max-w-[520px] text-[1.05rem] leading-[1.6]">
          {hasEntries
            ? `${data.ownerName} has logged ${stats.totalCount} film${stats.totalCount === 1 ? '' : 's'} so far.`
            : `${data.ownerName} hasn't logged a film yet.`}
        </p>

        {hasEntries && (
          <dl className="border-lm-line bg-lm-surface mx-auto mt-8 grid max-w-[560px] grid-cols-4 divide-x divide-[#33344294] overflow-hidden rounded-xl border">
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                Films logged
              </dt>
              <dd className="font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {counter(stats.totalCount)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                This year
              </dt>
              <dd className="font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {counter(stats.watchedThisYear)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                Liked
              </dt>
              <dd className="font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {counter(stats.likedCount)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                Avg rating
              </dt>
              <dd className="text-lm-amber font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {avgRatingDisplay}
                {stats.avgRating !== null && (
                  <span className="text-sm sm:text-base"> ★</span>
                )}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <Tear />

      {hasEntries ? (
        <section className="px-6 pt-[52px] pb-16">
          <div className="mx-auto mb-[26px] flex max-w-[1120px] flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-lm-amber text-xs font-bold tracking-[0.14em] uppercase">
                {getSortSectionLabel(search.sort)}
              </div>
              <h2 className="mt-2.5 text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold">
                Stubs
              </h2>
            </div>
          </div>

          <div className="mx-auto mb-[26px] max-w-[1120px]">
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
            <div className="mx-auto grid max-w-[1120px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[22px]">
              {entries.map((entry) => (
                <MovieStub
                  key={entry.id}
                  title={entry.movie.title}
                  subtitle={formatReleaseYear(entry.movie.releaseDate)}
                  posterUrl={entry.movie.posterImg}
                  rating={entry.rating}
                  liked={entry.like}
                  review={entry.review}
                  dateWatchedLabel={formatDateWatched(entry.dateWatched)}
                />
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
        </section>
      ) : (
        <section className="px-6 pt-[52px] pb-16">
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
