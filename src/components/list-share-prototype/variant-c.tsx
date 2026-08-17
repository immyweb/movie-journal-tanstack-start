import { Film, ListVideo } from 'lucide-react'

import { EmptyStateCard } from '#/components/empty-state-card'
import { formatReleaseYear } from '#/lib/format-release-year'
import type { ListSharePrototypeData } from '#/lib/list-share-prototype/get-list-by-share-token'

export const variantCName = 'Curator hero'

// PROTOTYPE for issue #14. A hero banner (owner attribution front and
// centre, like a curated-playlist landing page) above a horizontally
// scrolling filmstrip — the structurally different take, versus A's static
// grid and B's vertical list.
export function VariantC({ list }: { list: ListSharePrototypeData }) {
  return (
    <section>
      <div className="border-lm-line bg-lm-surface border-b px-6 py-16 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          A list by {list.ownerName}
        </div>
        <h1 className="mt-3 mb-4 text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          {list.name}
        </h1>
        {list.description && (
          <p className="text-lm-mist mx-auto max-w-[560px] text-[1.1rem] leading-[1.6]">
            {list.description}
          </p>
        )}
      </div>

      {list.items.length > 0 ? (
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 py-12">
          {list.items.map(({ movie }) => (
            <div key={movie.tmdbId} className="w-[180px] shrink-0 snap-start">
              <div className="border-lm-line bg-lm-ink aspect-[2/3] overflow-hidden rounded-xl border shadow-[0_16px_32px_-16px_rgba(0,0,0,0.6)]">
                {movie.posterImg ? (
                  <img
                    src={movie.posterImg}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-lm-mist flex h-full w-full items-center justify-center">
                    <Film aria-hidden="true" size={32} />
                  </div>
                )}
              </div>
              <div className="mt-3 text-[14px] font-extrabold">
                {movie.title}
              </div>
              <div className="text-lm-mist text-[12px]">
                {formatReleaseYear(movie.releaseDate)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-16">
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
        </div>
      )}
    </section>
  )
}
