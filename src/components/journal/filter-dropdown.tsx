import { ChevronDown } from 'lucide-react'
import { Popover } from 'radix-ui'

import { cn } from '#/lib/utils'

// The compact trigger+panel shell every filter group renders as — a single
// pill-shaped button showing "Label: summary" that opens a small popover
// with the group's actual radio/checkbox pills inside. Keeps the filter bar
// to one tidy row instead of a stacked label-and-pill-list per group.
export function FilterDropdown({
  label,
  summary,
  active,
  open,
  onOpenChange,
  children,
}: {
  label: string
  summary: string
  active: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            'focus-visible:outline-lm-amber inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold tracking-[0.03em] outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
            active
              ? 'border-lm-amber/40 bg-lm-amber/14 text-lm-amber'
              : 'border-lm-line bg-lm-mist/10 text-[#9698aa] hover:bg-lm-mist/16',
          )}
        >
          <span className="font-lm-mono uppercase tracking-[0.06em]">
            {label}:
          </span>
          <span className="max-w-[8.5rem] truncate normal-case">{summary}</span>
          <ChevronDown
            aria-hidden="true"
            size={14}
            className="shrink-0 opacity-70"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="border-lm-line bg-lm-surface z-50 max-w-[min(320px,calc(100vw-2.5rem))] rounded-xl border p-3 shadow-xl shadow-black/30 outline-none"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
