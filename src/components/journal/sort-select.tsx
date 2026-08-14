import { ChevronDown } from 'lucide-react'

import { journalSortOptions, type JournalSort } from '#/lib/journal/sort'

export function SortSelect({
  value,
  onChange,
}: {
  value: JournalSort
  onChange: (value: JournalSort) => void
}) {
  return (
    <div className="relative inline-flex h-9 items-center">
      <label htmlFor="journal-sort" className="sr-only">
        Sort by
      </label>
      <select
        id="journal-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as JournalSort)}
        className="border-lm-line bg-lm-mist/10 text-[#9698aa] focus-visible:border-lm-amber focus-visible:ring-lm-amber/30 h-9 cursor-pointer appearance-none rounded-full border py-0 pr-8 pl-3.5 text-xs font-bold tracking-[0.03em] outline-none transition-colors focus-visible:ring-3"
      >
        {journalSortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={14}
        className="text-lm-mist pointer-events-none absolute right-3 opacity-70"
      />
    </div>
  )
}
