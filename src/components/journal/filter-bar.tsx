import { DecadeFilter } from '#/components/journal/decade-filter'
import { GenreFilter } from '#/components/journal/genre-filter'
import { LikedFilter } from '#/components/journal/liked-filter'
import { RatingFilter } from '#/components/journal/rating-filter'
import { SortSelect } from '#/components/journal/sort-select'
import { cn } from '#/lib/utils'
import type { JournalSort } from '#/lib/journal/sort'

export function JournalFilterBar({
  liked,
  minRating,
  genre,
  genreOptions,
  decade,
  decadeOptions,
  sort,
  resultsCount,
  onLikedChange,
  onMinRatingChange,
  onGenreChange,
  onDecadeChange,
  onSortChange,
}: {
  liked: boolean | undefined
  minRating: number | undefined
  genre: Array<string> | undefined
  genreOptions: Array<string>
  decade: Array<number> | undefined
  decadeOptions: Array<number>
  sort: JournalSort
  resultsCount: number
  onLikedChange: (value: boolean | undefined) => void
  onMinRatingChange: (value: number | undefined) => void
  onGenreChange: (value: Array<string> | undefined) => void
  onDecadeChange: (value: Array<number> | undefined) => void
  onSortChange: (value: JournalSort) => void
}) {
  const isFiltered =
    liked !== undefined ||
    minRating !== undefined ||
    genre !== undefined ||
    decade !== undefined

  return (
    <div className="border-lm-line bg-lm-surface/60 mx-auto mb-[26px] flex max-w-[1120px] flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <LikedFilter value={liked} onChange={onLikedChange} />
        <RatingFilter value={minRating} onChange={onMinRatingChange} />
        <GenreFilter
          value={genre}
          options={genreOptions}
          onChange={onGenreChange}
        />
        <DecadeFilter
          value={decade}
          options={decadeOptions}
          onChange={onDecadeChange}
        />
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
