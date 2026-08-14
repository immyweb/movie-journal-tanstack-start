import { FilterDropdown } from '#/components/journal/filter-dropdown'
import { FilterPill } from '#/components/journal/filter-pill'
import { formatDecade } from '#/lib/journal/decade'

// Multi-select — ANY of the selected decades matches (issue #5). Not
// rendered at all when there are no decades to offer, since the option list
// only ever reflects decades actually present across the current user's
// Journal entries. The panel stays open across toggles (unlike
// Liked/Rating) so several decades can be picked in one pass.
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
  const summary =
    selected.length === 0
      ? 'All'
      : selected.length === 1
        ? formatDecade(selected[0]!)
        : `${selected.length} selected`

  function toggle(decade: number) {
    const next = selected.includes(decade)
      ? selected.filter((selectedDecade) => selectedDecade !== decade)
      : [...selected, decade]
    onChange(next.length === 0 ? undefined : next)
  }

  return (
    <FilterDropdown
      label="Decade"
      summary={summary}
      active={selected.length > 0}
    >
      <div
        role="group"
        aria-label="Decade"
        className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto"
      >
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
    </FilterDropdown>
  )
}
