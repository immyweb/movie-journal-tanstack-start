import { createFileRoute } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'

import { getJournalEntries } from '#/lib/journal/entries'
import { formatReleaseYear } from '#/lib/format-release-year'
import { Tear } from '#/components/tear-divider'
import { TicketLink } from '#/components/ticket-button'
import { MovieStub } from '#/components/movie-stub'

export const Route = createFileRoute('/_authed/journal')({
  loader: () => getJournalEntries(),
  head: () => ({
    meta: [{ title: 'Your journal — Movie Journal' }],
  }),
  component: JournalPage,
})

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value)
}

function formatDateWatched(value: Date | string) {
  // dateWatched is stored as a UTC-anchored calendar date (see logFilm) —
  // format in UTC too, so the date shown always matches what was picked,
  // regardless of the viewer's local timezone.
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(toDate(value))
    .toUpperCase()
}

// Zero-padded, like a box-office ticket-machine counter.
function counter(value: number) {
  return String(value).padStart(3, '0')
}

function JournalPage() {
  const { user } = Route.useRouteContext()
  const entries = Route.useLoaderData()

  const firstName = user.name.split(' ')[0]
  const hasEntries = entries.length > 0

  const thisYear = new Date().getFullYear()
  const watchedThisYear = entries.filter(
    (entry) => toDate(entry.dateWatched).getFullYear() === thisYear,
  ).length
  const likedCount = entries.filter((entry) => entry.like).length
  const ratedEntries = entries.filter((entry) => entry.rating != null)
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
            ? `You've logged ${entries.length} film${entries.length === 1 ? '' : 's'} so far.`
            : "You haven't logged a film yet — your first stub is one watch away."}
        </p>

        {hasEntries && (
          <dl className="border-lm-line bg-lm-surface mx-auto mt-8 grid max-w-[560px] grid-cols-4 divide-x divide-[#33344294] overflow-hidden rounded-xl border">
            <div className="flex flex-col gap-1 px-2.5 py-4 sm:px-5">
              <dt className="text-lm-mist font-lm-mono text-[9px] leading-tight tracking-[0.08em] uppercase sm:text-[10.5px]">
                Films logged
              </dt>
              <dd className="font-lm-mono text-lg font-bold tabular-nums sm:text-2xl">
                {counter(entries.length)}
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
                In order of last seen
              </div>
              <h2 className="mt-2.5 text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold">
                Your stubs
              </h2>
            </div>
            <TicketLink to="/journal/new" className="px-6 py-3 text-[14px]">
              Log a film
            </TicketLink>
          </div>

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
        </section>
      ) : (
        <section className="px-6 pt-[52px] pb-16">
          <div className="border-lm-line bg-lm-surface/40 mx-auto flex max-w-[560px] flex-col items-center gap-4 rounded-xl border-2 border-dashed px-8 py-14 text-center">
            <span className="border-lm-amber/40 text-lm-amber flex size-12 items-center justify-center rounded-full border-2">
              <Ticket aria-hidden="true" size={22} />
            </span>
            <h2 className="text-[1.3rem] font-extrabold">No stubs yet</h2>
            <p className="text-lm-mist max-w-[360px] text-[14.5px] leading-[1.6]">
              Log the first film you watch and it&rsquo;ll show up here, stub
              and all.
            </p>
            <TicketLink to="/journal/new" className="mt-2">
              Log your first watch
            </TicketLink>
          </div>
        </section>
      )}
    </>
  )
}
