import {
  createFileRoute,
  Link,
  notFound,
  stripSearchParams,
} from '@tanstack/react-router'
import { SearchX, Ticket } from 'lucide-react'

import { getPublicJournal } from '#/lib/journal/get-public-journal'
import {
  journalSearchSchema,
  type JournalSearch,
} from '#/lib/journal/search-params'
import { defaultJournalSort, getSortSectionLabel } from '#/lib/journal/sort'
import { cn } from '#/lib/utils'
import { formatReleaseYear } from '#/lib/format-release-year'
import { formatDateWatched } from '#/lib/format-date-watched'
import { Tear } from '#/components/tear-divider'
import { TicketLink, ticketButtonClass } from '#/components/ticket-button'
import { MovieStub } from '#/components/movie-stub'
import { EmptyStateCard } from '#/components/empty-state-card'
import { JournalFilterBar } from '#/components/journal/filter-bar'

// Signed-out public Journal view (`/journal/u/{username}`, ADR 0015 as
// amended by ADR 0016 — the `/u` segment avoids colliding with the
// authenticated film-detail route at `/journal/{entryId}`). Near-direct
// reuse of the authenticated Journal page (variant A from the issue #14
// prototype): same stats strip, filter bar, sort, and stub grid. Two
// deltas: the welcome banner becomes an attribution line, and stubs aren't
// links (no public film-detail route exists, and there's no edit
// affordance to reach either way). Not-found for both an unknown username
// and a known one with journalIsPublic: false — getPublicJournal collapses
// both to `null` so a visitor can't tell them apart.
export const Route = createFileRoute('/_public/journal/u/$username')({
  validateSearch: journalSearchSchema,
  search: {
    middlewares: [stripSearchParams({ sort: defaultJournalSort })],
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ params, deps }) => {
    const data = await getPublicJournal({
      data: { username: params.username, search: deps.search },
    })

    if (!data) throw notFound()

    return data
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.ownerName}’s journal — Movie Journal` }]
      : undefined,
  }),
  notFoundComponent: PublicJournalNotFound,
  component: PublicJournalPage,
})

// Zero-padded, like a box-office ticket-machine counter — matches the
// authenticated Journal page's stats strip.
function counter(value: number) {
  return String(value).padStart(3, '0')
}

function PublicJournalPage() {
  const { ownerName, entries, genreOptions, decadeOptions, stats } =
    Route.useLoaderData()
  const { username } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  function setJournalFilter<K extends keyof JournalSearch>(
    field: K,
    value: JournalSearch[K],
  ) {
    navigate({
      search: (prev) => ({ ...prev, [field]: value }),
      replace: true,
    })
  }

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
          {ownerName}&rsquo;s journal
        </h1>
        <p className="text-lm-mist mx-auto max-w-[520px] text-[1.05rem] leading-[1.6]">
          {hasEntries
            ? `${ownerName} has logged ${stats.totalCount} film${stats.totalCount === 1 ? '' : 's'} so far.`
            : `${ownerName} hasn't logged a film yet.`}
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
              onLikedChange={(liked) => setJournalFilter('liked', liked)}
              onMinRatingChange={(minRating) =>
                setJournalFilter('minRating', minRating)
              }
              onGenreChange={(genre) => setJournalFilter('genre', genre)}
              onDecadeChange={(decade) => setJournalFilter('decade', decade)}
              onSortChange={(sort) => setJournalFilter('sort', sort)}
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
              action={
                <Link
                  to="/journal/u/$username"
                  params={{ username }}
                  search={{}}
                  className={cn(ticketButtonClass, 'mt-2')}
                >
                  Clear filters
                </Link>
              }
            >
              Nothing matches the current filters. Clear them to see everything
              again.
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
            {ownerName} hasn&rsquo;t logged a film yet.
          </EmptyStateCard>
        </section>
      )}
    </>
  )
}

function PublicJournalNotFound() {
  return (
    <section className="px-6 pt-6 pb-16">
      <EmptyStateCard
        icon={Ticket}
        heading={
          <h1 className="text-[1.3rem] font-extrabold">
            No public journal here
          </h1>
        }
        action={<TicketLink to="/">Back to Movie Journal</TicketLink>}
      >
        This link doesn&rsquo;t match anyone&rsquo;s public journal.
      </EmptyStateCard>
    </section>
  )
}
