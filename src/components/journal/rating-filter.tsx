import { useState } from 'react'

import { FilterDropdown } from '#/components/journal/filter-dropdown'
import { FilterPill } from '#/components/journal/filter-pill'

const RATING_VALUES = [1, 2, 3, 4, 5] as const

export function RatingFilter({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (value: number | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const summary = value === undefined ? 'Any' : `${value}+ ★`

  return (
    <FilterDropdown
      label="Rating"
      summary={summary}
      active={value !== undefined}
      open={open}
      onOpenChange={setOpen}
    >
      <div
        role="radiogroup"
        aria-label="Minimum rating"
        className="flex flex-wrap gap-1.5"
      >
        <FilterPill
          selected={value === undefined}
          onClick={() => {
            onChange(undefined)
            setOpen(false)
          }}
        >
          Any
        </FilterPill>
        {RATING_VALUES.map((rating) => (
          <FilterPill
            key={rating}
            selected={value === rating}
            aria-label={`${rating} star${rating === 1 ? '' : 's'} and up`}
            onClick={() => {
              onChange(rating)
              setOpen(false)
            }}
          >
            {rating}+ ★
          </FilterPill>
        ))}
      </div>
    </FilterDropdown>
  )
}
