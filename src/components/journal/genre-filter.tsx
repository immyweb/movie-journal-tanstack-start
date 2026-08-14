import { FilterPill } from '#/components/journal/filter-pill'

// Multi-select — a film can carry several genres, so ANY of the selected
// genres matches (issue #4). Not rendered at all when there are no genres
// to offer, since the option list only ever reflects genres actually
// present across the current user's Journal entries.
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

  function toggle(genre: string) {
    const next = selected.includes(genre)
      ? selected.filter((selectedGenre) => selectedGenre !== genre)
      : [...selected, genre]
    onChange(next.length === 0 ? undefined : next)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-lm-mono text-lm-mist text-xs font-bold tracking-[0.08em] uppercase">
        Genre
      </span>
      <div role="group" aria-label="Genre" className="flex flex-wrap gap-1.5">
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
    </div>
  )
}
