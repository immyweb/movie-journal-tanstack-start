import { LikedFilter } from '#/components/journal/liked-filter'
import { SortSelect } from '#/components/journal/sort-select'
import { cn } from '#/lib/utils'
import type { JournalSort } from '#/lib/journal/search-params'

export function JournalFilterBar({
  liked,
  sort,
  resultsCount,
  onLikedChange,
  onSortChange,
}: {
  liked: boolean | undefined
  sort: JournalSort
  resultsCount: number
  onLikedChange: (value: boolean | undefined) => void
  onSortChange: (value: JournalSort) => void
}) {
  const isFiltered = liked !== undefined

  return (
    <div className="border-lm-line bg-lm-surface/60 mx-auto mb-[26px] flex max-w-[1120px] flex-wrap items-end justify-between gap-4 rounded-xl border px-5 py-4">
      <div className="flex flex-wrap items-end gap-5">
        <LikedFilter value={liked} onChange={onLikedChange} />
        <SortSelect value={sort} onChange={onSortChange} />
      </div>
      {/* Always mounted (not conditionally rendered) so a screen reader's
          first announcement after filtering is a mutation of an existing
          live region, not the region's own insertion — insertion isn't
          reliably announced by all assistive tech. */}
      <p
        aria-live="polite"
        className={cn(
          'text-lm-mist font-lm-mono text-xs tracking-[0.08em] uppercase',
          !isFiltered && 'sr-only',
        )}
      >
        {isFiltered && `${resultsCount} result${resultsCount === 1 ? '' : 's'}`}
      </p>
    </div>
  )
}
