import {
  createFileRoute,
  Link,
  stripSearchParams,
} from '@tanstack/react-router'
import { SearchX, Ticket } from 'lucide-react'

import { getJournalEntries } from '#/lib/journal/entries'
import {
  defaultJournalSort,
  journalSearchSchema,
  type JournalSort,
} from '#/lib/journal/search-params'
import { cn } from '#/lib/utils'
import { formatReleaseYear } from '#/lib/format-release-year'
import { toDate, formatDateWatched } from '#/lib/format-date-watched'
import { Tear } from '#/components/tear-divider'
import { TicketLink, ticketButtonClass } from '#/components/ticket-button'
import { MovieStub } from '#/components/movie-stub'
import { EmptyStateCard } from '#/components/empty-state-card'
import { JournalFilterBar } from '#/components/journal/filter-bar'

export const Route = createFileRoute('/_authed/journal')({
  validateSearch: journalSearchSchema,
  search: {
    middlewares: [stripSearchParams({ sort: defaultJournalSort })],
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    const [allEntries, entries] = await Promise.all([
      getJournalEntries({ data: {} }),
      getJournalEntries({ data: deps.search }),
    ])
    return { allEntries, entries }
  },
  head: () => ({
    meta: [{ title: 'Your journal — Movie Journal' }],
  }),
  component: JournalPage,
})

// Zero-padded, like a box-office ticket-machine counter.
function counter(value: number) {
  return String(value).padStart(3, '0')
}

// Describes the active sort so the section subheading stays accurate once
// sorting is more than just "most recently watched".
function sortSectionLabel(sort: JournalSort) {
  switch (sort) {
    case 'earliest-watched':
      return 'Oldest watched first'
    case 'liked-first':
      return 'Liked films first'
    case 'most-recently-watched':
      return 'In order of last seen'
  }
}

function JournalPage() {
  const { user } = Route.useRouteContext()
  const { allEntries, entries } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const firstName = user.name.split(' ')[0]
  const hasEntries = allEntries.length > 0

  const thisYear = new Date().getFullYear()
  const watchedThisYear = allEntries.filter(
    (entry) => toDate(entry.dateWatched).getFullYear() === thisYear,
  ).length
  const likedCount = allEntries.filter((entry) => entry.like).length
  const ratedEntries = allEntries.filter((entry) => entry.rating != null)
  const avgRating =
    ratedEntries.length > 0
      ? (
          ratedEntries.reduce((sum, entry) => sum + (entry.rating ?? 0), 0) /
          ratedEntries.length
        ).toFixed(1)
      : '—'

  return (
    <>
      <section className="px-6 pt-6 pb-10 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Ticket holder
        </div>
        <h1 className="mt-2.5 mb-[14px] text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          Welcome back, {firstName}.
        </h1>
        <p className="text-lm-mist mx-auto max-w-[520px] text-[1.05rem] leading-[1.6]">
          {hasEntries
            ? `You've logged ${allEntries.length} film${allEntries.length === 1 ? '' : 's'} so far.`
            : "You haven't logged a film yet — your first stub is one watch away."}
        </p>

        {hasEntries && (
          <dl className="border-lm-line bg-lm-surface mx-auto mt-8 grid max-w-[560px] grid-cols-4 divide-x divide-[#33344294] overflow-hidden rounded-xl border">
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                Films logged
              </dt>
              <dd className="font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {counter(allEntries.length)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                This year
              </dt>
              <dd className="font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {counter(watchedThisYear)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                Liked
              </dt>
              <dd className="font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {counter(likedCount)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                Avg rating
              </dt>
              <dd className="text-lm-amber font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {avgRating}
                {avgRating !== '—' && (
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
                {sortSectionLabel(search.sort)}
              </div>
              <h2 className="mt-2.5 text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold">
                Your stubs
              </h2>
            </div>
            <TicketLink to="/journal/new" className="px-6 py-3 text-[14px]">
              Log a film
            </TicketLink>
          </div>

          <div className="mx-auto mb-[26px] max-w-[1120px]">
            <JournalFilterBar
              liked={search.liked}
              sort={search.sort}
              resultsCount={entries.length}
              onLikedChange={(liked) =>
                navigate({
                  search: (prev) => ({ ...prev, liked }),
                  replace: true,
                })
              }
              onSortChange={(sort) =>
                navigate({
                  search: (prev) => ({ ...prev, sort }),
                  replace: true,
                })
              }
            />
          </div>

          {entries.length > 0 ? (
            <div className="mx-auto grid max-w-[1120px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[22px]">
              {entries.map((entry) => (
                <Link
                  key={entry.id}
                  to="/journal/$entryId"
                  params={{ entryId: entry.id }}
                  className="focus-visible:outline-lm-amber rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <MovieStub
                    title={entry.movie.title}
                    subtitle={formatReleaseYear(entry.movie.releaseDate)}
                    posterUrl={entry.movie.posterImg}
                    rating={entry.rating}
                    liked={entry.like}
                    review={entry.review}
                    dateWatchedLabel={formatDateWatched(entry.dateWatched)}
                  />
                </Link>
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
                  to="/journal"
                  search={{}}
                  className={cn(ticketButtonClass, 'mt-2')}
                >
                  Clear filters
                </Link>
              }
            >
              Nothing in your journal matches the current filters. Clear them to
              see everything again.
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
            action={
              <TicketLink to="/journal/new" className="mt-2">
                Log your first watch
              </TicketLink>
            }
          >
            Log the first film you watch and it&rsquo;ll show up here, stub and
            all.
          </EmptyStateCard>
        </section>
      )}
    </>
  )
}
