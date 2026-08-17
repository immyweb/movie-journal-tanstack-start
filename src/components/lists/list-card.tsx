import { Film } from 'lucide-react'

import type { ListWithItems } from '#/lib/lists/lists'

// One card in the "Your lists" grid: up to 3 poster thumbnails, name,
// description, item count (issue #16's card-hub landing view).
export function ListCard({
  list,
  onOpen,
}: {
  list: ListWithItems
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="border-lm-line bg-lm-surface hover:border-lm-amber focus-visible:outline-lm-amber flex cursor-pointer flex-col gap-3 rounded-xl border p-4 text-left outline-none transition-colors focus-visible:outline-2"
    >
      <div className="flex -space-x-4">
        {list.listItems.length > 0 ? (
          list.listItems.slice(0, 3).map((item) => (
            <span
              key={item.movieId}
              className="bg-lm-ink border-lm-surface aspect-[2/3] w-14 shrink-0 overflow-hidden rounded border-2"
            >
              {item.movie.posterImg ? (
                <img
                  src={item.movie.posterImg}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lm-mist flex h-full w-full items-center justify-center">
                  <Film aria-hidden="true" size={16} />
                </span>
              )}
            </span>
          ))
        ) : (
          <span className="border-lm-line text-lm-mist flex aspect-[2/3] w-14 items-center justify-center rounded border border-dashed">
            <Film aria-hidden="true" size={16} />
          </span>
        )}
      </div>
      <div>
        <div className="text-[15px] font-extrabold">{list.name}</div>
        {list.description && (
          <div className="text-lm-mist mt-0.5 line-clamp-2 text-[13px]">
            {list.description}
          </div>
        )}
        <div className="text-lm-mist font-lm-mono mt-1.5 text-[10.5px] font-bold tracking-[0.06em] uppercase">
          {list.listItems.length} film{list.listItems.length === 1 ? '' : 's'}
        </div>
      </div>
    </button>
  )
}
