import type { JournalSort } from '#/lib/journal/search-params'

const SORT_OPTIONS: Array<{ value: JournalSort; label: string }> = [
  { value: 'most-recently-watched', label: 'Most recently watched' },
  { value: 'earliest-watched', label: 'Earliest watched' },
  { value: 'liked-first', label: 'Liked first' },
  { value: 'highest-rated', label: 'Highest rated' },
  { value: 'oldest-decade', label: 'Oldest decade' },
  { value: 'newest-decade', label: 'Newest decade' },
]

export function SortSelect({
  value,
  onChange,
}: {
  value: JournalSort
  onChange: (value: JournalSort) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="journal-sort"
        className="font-lm-mono text-lm-mist text-xs font-bold tracking-[0.08em] uppercase"
      >
        Sort by
      </label>
      <select
        id="journal-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as JournalSort)}
        className="border-lm-line bg-lm-ink text-lm-paper focus-visible:border-lm-amber focus-visible:ring-lm-amber/30 h-9 cursor-pointer rounded-md border px-2.5 text-sm outline-none transition-colors focus-visible:ring-3"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
