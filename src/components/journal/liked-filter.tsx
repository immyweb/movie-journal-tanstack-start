import { useState } from 'react'

import { FilterDropdown } from '#/components/journal/filter-dropdown'
import { FilterPill } from '#/components/journal/filter-pill'

const OPTIONS: Array<{
  value: 'all' | 'true' | 'false'
  label: string
  summary: string
}> = [
  { value: 'all', label: 'All', summary: 'All' },
  { value: 'true', label: 'Liked', summary: 'Yes' },
  { value: 'false', label: 'Not liked', summary: 'No' },
]

export function LikedFilter({
  value,
  onChange,
}: {
  value: boolean | undefined
  onChange: (value: boolean | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = value === undefined ? 'all' : value ? 'true' : 'false'
  const summary = OPTIONS.find((option) => option.value === selected)!.summary

  return (
    <FilterDropdown
      label="Liked"
      summary={summary}
      active={value !== undefined}
      open={open}
      onOpenChange={setOpen}
    >
      <div role="radiogroup" aria-label="Liked" className="flex gap-1.5">
        {OPTIONS.map((option) => (
          <FilterPill
            key={option.value}
            selected={selected === option.value}
            onClick={() => {
              onChange(
                option.value === 'all' ? undefined : option.value === 'true',
              )
              setOpen(false)
            }}
          >
            {option.label}
          </FilterPill>
        ))}
      </div>
    </FilterDropdown>
  )
}
