import { createFileRoute, notFound } from '@tanstack/react-router'
import { Film, ListVideo } from 'lucide-react'

import { getListByShareToken } from '#/lib/lists/get-list-by-share-token'
import { formatReleaseYear } from '#/lib/format-release-year'
import { EmptyStateCard } from '#/components/empty-state-card'
import { TicketLink } from '#/components/ticket-button'

// Signed-out List share view (`/lists/{shareToken}`, ADR 0015) — the
// "poster wall" variant that won the prototype round (issue #14), promoted
// close to as-is. shareToken alone is the lookup key; an unknown token
// renders the same not-found state as a deleted list, so a share link
// never distinguishes the two to a visitor.
export const Route = createFileRoute('/_public/lists/$shareToken')({
  loader: async ({ params }) => {
    const list = await getListByShareToken({
      data: { shareToken: params.shareToken },
    })

    if (!list) throw notFound()

    return list
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.name} — Movie Journal` }]
      : undefined,
  }),
  notFoundComponent: ListShareNotFound,
  component: ListSharePage,
})

function ListSharePage() {
  const list = Route.useLoaderData()

  return (
    <section className="mx-auto max-w-[1120px] px-6 py-14">
      <div className="mb-10 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          A list by {list.ownerName}
        </div>
        <h1 className="mt-2.5 mb-3 text-[clamp(2rem,5vw,3rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          {list.name}
        </h1>
        {list.description && (
          <p className="text-lm-mist mx-auto max-w-[520px] text-[1.05rem] leading-[1.6]">
            {list.description}
          </p>
        )}
      </div>

      {list.items.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
          {list.items.map(({ movie }) => (
            <div key={movie.tmdbId} className="group">
              <div className="border-lm-line bg-lm-surface aspect-[2/3] overflow-hidden rounded-lg border">
                {movie.posterImg ? (
                  <img
                    src={movie.posterImg}
                    alt={`${movie.title} poster`}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-lm-mist flex h-full w-full items-center justify-center">
                    <Film aria-hidden="true" size={28} />
                  </div>
                )}
              </div>
              <div className="mt-2 truncate text-[13px] font-bold">
                {movie.title}
              </div>
              <div className="text-lm-mist text-[11px]">
                {formatReleaseYear(movie.releaseDate)}
              </div>
            </div>
          ))}
        </div>
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

function ListShareNotFound() {
  return (
    <section className="px-6 pt-6 pb-16">
      <EmptyStateCard
        icon={ListVideo}
        heading={
          <h1 className="text-[1.3rem] font-extrabold">
            This share link doesn&rsquo;t lead anywhere
          </h1>
        }
        action={<TicketLink to="/">Back to Movie Journal</TicketLink>}
      >
        The list may have been deleted, or the link isn&rsquo;t valid.
      </EmptyStateCard>
    </section>
  )
}
