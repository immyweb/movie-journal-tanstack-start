import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Film, Heart } from 'lucide-react'

import { cn } from '#/lib/utils'
import { formatDateWatched } from '#/lib/format-date-watched'
import { getJournalEntryDetail } from '#/lib/journal/entry-detail'
import { Stars } from '#/components/stars'
import { ticketButtonClass } from '#/components/ticket-button'
import { EntryNotFound } from '#/components/entry-not-found'

export const Route = createFileRoute('/_authed/journal_/$entryId')({
  loader: async ({ params }) => {
    const result = await getJournalEntryDetail({
      data: { entryId: params.entryId },
    })

    if (!result) throw notFound()

    return result
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.entry.movie.title} — Movie Journal` }]
      : undefined,
  }),
  notFoundComponent: EntryNotFound,
  component: EntryDetailPage,
})

function EntryDetailPage() {
  const { entry, detail, watchCount } = Route.useLoaderData()
  const movie = entry.movie

  // Prefer the live, higher-resolution TMDB art for the hero; fall back to
  // the Movie's cached w342 poster if the detail fetch failed.
  const backdropUrl = detail?.backdropUrl ?? null
  const posterUrl = detail?.posterUrl ?? movie.posterImg
  const heroImage = backdropUrl ?? posterUrl

  const releaseYear = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null
  const metaLine = [releaseYear, detail?.runtime, detail?.genre]
    .filter((part): part is string => part != null)
    .join(' · ')

  return (
    <>
      <section className="relative -mt-[111px] h-[calc(clamp(360px,54vw,560px)+111px)] overflow-hidden">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              backdropUrl
                ? '[filter:saturate(1.08)_contrast(1.05)_brightness(0.92)]'
                : 'scale-110 blur-2xl [filter:saturate(1.15)_brightness(0.5)]',
            )}
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 [background-image:linear-gradient(to_top,var(--color-lm-ink)_0%,rgba(20,21,29,0.94)_32%,rgba(20,21,29,0.5)_62%,transparent_88%)]"
        />

        <div className="relative flex h-full flex-col justify-end px-6 pb-[128px] text-center [text-shadow:0_2px_16px_rgba(20,21,29,0.85)] sm:pb-[160px]">
          <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
            Now showing
          </div>
          <h1 className="mt-2.5 mb-2 text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
            {movie.title}
          </h1>
          {metaLine && (
            <p className="text-lm-mist font-lm-mono text-[11.5px] tracking-[0.08em] uppercase">
              {metaLine}
            </p>
          )}
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="relative mx-auto -mt-[76px] flex max-w-[880px] flex-col items-start gap-6 sm:-mt-[104px] sm:flex-row">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div
              aria-hidden="true"
              className="bg-lm-amber/25 absolute -inset-6 -z-10 rounded-full blur-3xl"
            />
            <div className="bg-lm-ink border-lm-line w-[136px] overflow-hidden rounded-xl border shadow-[0_24px_48px_-16px_rgba(0,0,0,0.7)] sm:w-[176px]">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  className="block aspect-[2/3] w-full object-cover [filter:saturate(1.05)_contrast(1.03)]"
                />
              ) : (
                <div className="text-lm-mist flex aspect-[2/3] w-full items-center justify-center">
                  <Film aria-hidden="true" size={28} />
                </div>
              )}
            </div>
          </div>

          <div className="border-lm-line bg-lm-surface w-full min-w-0 flex-1 rounded-xl border p-6">
            <div className="mb-7 flex items-center gap-4">
              <Stars rating={entry.rating} size="lg" />
              {entry.like && (
                <span
                  aria-label="Liked"
                  className="bg-lm-red/16 shadow-[0_0_22px_-6px_rgba(197,64,90,0.55)] flex size-12 shrink-0 items-center justify-center rounded-full text-[#e77b90]"
                >
                  <Heart
                    aria-hidden="true"
                    size={24}
                    className="fill-current"
                  />
                </span>
              )}
            </div>

            <div className="font-lm-mono text-lm-mist text-[11.5px] tracking-[0.04em]">
              WATCHED {formatDateWatched(entry.dateWatched)}
            </div>
            {watchCount > 1 && (
              <p className="text-lm-mist mt-2 text-sm">
                You&rsquo;ve logged this film {watchCount} times.
              </p>
            )}

            {entry.review && (
              <p className="text-lm-paper border-lm-line mt-5 border-t pt-5 text-[15px] leading-[1.6] italic">
                &ldquo;{entry.review}&rdquo;
              </p>
            )}

            {detail && (
              <dl className="border-lm-line mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-5 text-sm">
                {[
                  { label: 'Director', value: detail.director },
                  { label: 'Language', value: detail.language },
                ]
                  .filter(
                    (field): field is { label: string; value: string } =>
                      field.value != null,
                  )
                  .map((field) => (
                    <div key={field.label}>
                      <dt className="text-lm-mist font-lm-mono text-[10.5px] tracking-[0.08em] uppercase">
                        {field.label}
                      </dt>
                      <dd className="mt-1">{field.value}</dd>
                    </div>
                  ))}
                {detail.cast.length > 0 && (
                  <div className="col-span-2">
                    <dt className="text-lm-mist font-lm-mono text-[10.5px] tracking-[0.08em] uppercase">
                      Cast
                    </dt>
                    <dd className="mt-1">{detail.cast.join(', ')}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-[880px] items-center justify-between gap-4">
          <Link
            to="/journal"
            className="text-lm-amber font-lm-mono cursor-pointer text-xs tracking-[0.08em] uppercase underline underline-offset-4"
          >
            Back to journal
          </Link>
          <Link
            to="/journal/$entryId/edit"
            params={{ entryId: entry.id }}
            className={cn(ticketButtonClass, 'px-6 py-3 text-[14px]')}
          >
            Edit
          </Link>
        </div>
      </section>
    </>
  )
}
