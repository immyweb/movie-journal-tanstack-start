import { FilterPill } from '#/components/journal/filter-pill'

const OPTIONS: Array<{ value: 'all' | 'true' | 'false'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'true', label: 'Liked' },
  { value: 'false', label: 'Not liked' },
]

export function LikedFilter({
  value,
  onChange,
}: {
  value: boolean | undefined
  onChange: (value: boolean | undefined) => void
}) {
  const selected = value === undefined ? 'all' : value ? 'true' : 'false'

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-lm-mono text-lm-mist text-xs font-bold tracking-[0.08em] uppercase">
        Liked
      </span>
      <div role="radiogroup" aria-label="Liked" className="flex gap-1.5">
        {OPTIONS.map((option) => (
          <FilterPill
            key={option.value}
            selected={selected === option.value}
            onClick={() =>
              onChange(
                option.value === 'all' ? undefined : option.value === 'true',
              )
            }
          >
            {option.label}
          </FilterPill>
        ))}
      </div>
    </div>
  )
}
