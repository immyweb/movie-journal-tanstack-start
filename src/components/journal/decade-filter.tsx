import { FilterPill } from '#/components/journal/filter-pill'
import { formatDecade } from '#/lib/journal/decade'

// Multi-select — ANY of the selected decades matches (issue #5). Not
// rendered at all when there are no decades to offer, since the option list
// only ever reflects decades actually present across the current user's
// Journal entries.
export function DecadeFilter({
  value,
  options,
  onChange,
}: {
  value: Array<number> | undefined
  options: Array<number>
  onChange: (value: Array<number> | undefined) => void
}) {
  if (options.length === 0) return null

  const selected = value ?? []

  function toggle(decade: number) {
    const next = selected.includes(decade)
      ? selected.filter((selectedDecade) => selectedDecade !== decade)
      : [...selected, decade]
    onChange(next.length === 0 ? undefined : next)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-lm-mono text-lm-mist text-xs font-bold tracking-[0.08em] uppercase">
        Decade
      </span>
      <div role="group" aria-label="Decade" className="flex flex-wrap gap-1.5">
        {options.map((decade) => (
          <FilterPill
            key={decade}
            role="checkbox"
            selected={selected.includes(decade)}
            onClick={() => toggle(decade)}
          >
            {formatDecade(decade)}
          </FilterPill>
        ))}
      </div>
    </div>
  )
}
