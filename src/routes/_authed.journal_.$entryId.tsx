import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Film } from 'lucide-react'

import { cn } from '#/lib/utils'
import { formatReleaseYear } from '#/lib/format-release-year'
import { formatDateWatched } from '#/lib/format-date-watched'
import { getJournalEntryDetail } from '#/lib/journal/entry-detail'
import { Stars } from '#/components/stars'
import { ticketButtonClass } from '#/components/ticket-button'

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
  component: EntryDetailPage,
})

function EntryDetailPage() {
  const { entry, detail, watchCount } = Route.useLoaderData()
  const movie = entry.movie

  return (
    <>
      <section className="px-6 pt-6 pb-10 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Stub detail
        </div>
        <h1 className="mt-2.5 mb-[14px] text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          {movie.title}
        </h1>
        <p className="text-lm-mist mx-auto max-w-[520px] text-[1.05rem] leading-[1.6]">
          {formatReleaseYear(movie.releaseDate)}
        </p>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-[720px]">
          <div className="border-lm-line bg-lm-surface rounded-xl border p-6">
            <div className="mb-6 flex items-start gap-4">
              <div className="bg-lm-ink w-24 shrink-0 overflow-hidden rounded-md">
                {movie.posterImg ? (
                  <img
                    src={movie.posterImg}
                    alt=""
                    className="block aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="text-lm-mist flex aspect-[2/3] w-full items-center justify-center">
                    <Film aria-hidden="true" size={28} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Stars rating={entry.rating} />
                  <span
                    className={
                      entry.like
                        ? 'bg-lm-red/16 rounded-full px-[9px] py-1 text-xs font-bold tracking-[0.05em] text-[#e77b90]'
                        : 'bg-lm-mist/14 text-lm-mist rounded-full px-[9px] py-1 text-xs font-bold tracking-[0.05em]'
                    }
                  >
                    {entry.like ? 'Liked' : 'Not liked'}
                  </span>
                </div>
                <div className="font-lm-mono text-[11.5px] tracking-[0.04em] text-[#5f6178]">
                  WATCHED {formatDateWatched(entry.dateWatched)}
                </div>
                {watchCount > 1 && (
                  <p className="text-lm-mist text-sm">
                    You&rsquo;ve logged this film {watchCount} times.
                  </p>
                )}
              </div>
            </div>

            {entry.review && (
              <p className="text-lm-paper border-lm-line mb-6 border-t pt-5 text-[15px] leading-[1.6] italic">
                &ldquo;{entry.review}&rdquo;
              </p>
            )}

            {detail && (
              <dl className="border-lm-line grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-5 text-sm sm:grid-cols-3">
                {[
                  { label: 'Director', value: detail.director },
                  { label: 'Genre', value: detail.genre },
                  { label: 'Runtime', value: detail.runtime },
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
                  <div className="col-span-2 sm:col-span-3">
                    <dt className="text-lm-mist font-lm-mono text-[10.5px] tracking-[0.08em] uppercase">
                      Cast
                    </dt>
                    <dd className="mt-1">{detail.cast.join(', ')}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
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
        </div>
      </section>
    </>
  )
}
