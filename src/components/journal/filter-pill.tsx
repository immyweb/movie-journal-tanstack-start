import { cn } from '#/lib/utils'

// The pill button shared by every filter-bar group — single-choice ones
// (Liked, Rating) use the default `role="radio"`; multi-select ones (Genre,
// future Decade) pass `role="checkbox"` — one place to keep their look and
// focus styling consistent either way.
export function FilterPill({
  selected,
  onClick,
  role = 'radio',
  'aria-label': ariaLabel,
  children,
}: {
  selected: boolean
  onClick: () => void
  role?: 'radio' | 'checkbox'
  'aria-label'?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        'focus-visible:outline-lm-amber cursor-pointer rounded-full px-[14px] py-2 text-xs font-bold tracking-[0.05em] outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
        selected
          ? 'bg-lm-amber text-[#1c1408]'
          : 'bg-lm-mist/14 text-[#9698aa] hover:bg-lm-mist/22',
      )}
    >
      {children}
    </button>
  )
}
