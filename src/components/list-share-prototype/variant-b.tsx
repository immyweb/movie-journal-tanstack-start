import { Film, ListVideo } from 'lucide-react'

import { EmptyStateCard } from '#/components/empty-state-card'
import { formatReleaseYear } from '#/lib/format-release-year'
import type { ListSharePrototypeData } from '#/lib/list-share-prototype/get-list-by-share-token'

export const variantBName = 'Ticket queue'

function counter(value: number) {
  return String(value).padStart(2, '0')
}

// PROTOTYPE for issue #14. Borrows the app's ticket-stub visual language
// (dashed tear, ticket-counter numbering) for a numbered queue — reads as
// "here's the watch order", not a gallery.
export function VariantB({ list }: { list: ListSharePrototypeData }) {
  return (
    <section className="mx-auto max-w-[720px] px-6 py-14">
      <div className="mb-10">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          List
        </div>
        <h1 className="mt-2.5 mb-3 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.1] font-black tracking-[-0.01em]">
          {list.name}
        </h1>
        {list.description && (
          <p className="text-lm-mist text-[1rem] leading-[1.6]">
            {list.description}
          </p>
        )}
        <div className="font-lm-mono text-lm-mist mt-4 text-[11.5px] tracking-[0.04em] uppercase">
          Curated by {list.ownerName} · {list.items.length} film
          {list.items.length === 1 ? '' : 's'}
        </div>
      </div>

      {list.items.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {list.items.map(({ movie }, i) => (
            <li
              key={movie.tmdbId}
              className="border-lm-line bg-lm-surface flex items-center gap-4 rounded-xl border p-3"
            >
              <span className="font-lm-mono text-lm-mist w-6 shrink-0 text-right text-sm tabular-nums">
                {counter(i + 1)}
              </span>
              <div className="bg-lm-ink h-[72px] w-12 shrink-0 overflow-hidden rounded-md">
                {movie.posterImg ? (
                  <img
                    src={movie.posterImg}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-lm-mist flex h-full w-full items-center justify-center">
                    <Film aria-hidden="true" size={18} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-extrabold">
                  {movie.title}
                </div>
                <div className="text-lm-mist text-[13px]">
                  {formatReleaseYear(movie.releaseDate)}
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyStateCard
          icon={ListVideo}
          heading={
            <h2 className="text-[1.3rem] font-extrabold">
              Nothing on this list yet
            </h2>
          }
        >
          {list.ownerName} hasn&rsquo;t added any films to this list yet.
        </EmptyStateCard>
      )}
    </section>
  )
}
