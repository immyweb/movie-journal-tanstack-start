import { FilterDropdown } from '#/components/journal/filter-dropdown'
import { FilterPill } from '#/components/journal/filter-pill'

// Multi-select — a film can carry several genres, so ANY of the selected
// genres matches (issue #4). Not rendered at all when there are no genres
// to offer, since the option list only ever reflects genres actually
// present across the current user's Journal entries. The panel stays open
// across toggles (unlike Liked/Rating) so several genres can be picked in
// one pass.
export function GenreFilter({
  value,
  options,
  onChange,
}: {
  value: Array<string> | undefined
  options: Array<string>
  onChange: (value: Array<string> | undefined) => void
}) {
  if (options.length === 0) return null

  const selected = value ?? []
  const summary =
    selected.length === 0
      ? 'All'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`

  function toggle(genre: string) {
    const next = selected.includes(genre)
      ? selected.filter((selectedGenre) => selectedGenre !== genre)
      : [...selected, genre]
    onChange(next.length === 0 ? undefined : next)
  }

  return (
    <FilterDropdown
      label="Genre"
      summary={summary}
      active={selected.length > 0}
    >
      <div
        role="group"
        aria-label="Genre"
        className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto"
      >
        {options.map((genre) => (
          <FilterPill
            key={genre}
            role="checkbox"
            selected={selected.includes(genre)}
            onClick={() => toggle(genre)}
          >
            {genre}
          </FilterPill>
        ))}
      </div>
    </FilterDropdown>
  )
}
