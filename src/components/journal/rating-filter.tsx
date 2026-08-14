import { FilterPill } from '#/components/journal/filter-pill'

const RATING_VALUES = [1, 2, 3, 4, 5] as const

export function RatingFilter({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (value: number | undefined) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-lm-mono text-lm-mist text-xs font-bold tracking-[0.08em] uppercase">
        Min rating
      </span>
      <div
        role="radiogroup"
        aria-label="Minimum rating"
        className="flex gap-1.5"
      >
        <FilterPill
          selected={value === undefined}
          onClick={() => onChange(undefined)}
        >
          Any
        </FilterPill>
        {RATING_VALUES.map((rating) => (
          <FilterPill
            key={rating}
            selected={value === rating}
            aria-label={`${rating} star${rating === 1 ? '' : 's'} and up`}
            onClick={() => onChange(rating)}
          >
            {rating}+ ★
          </FilterPill>
        ))}
      </div>
    </div>
  )
}
