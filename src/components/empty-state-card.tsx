import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

// The dashed-border, icon-in-a-circle placeholder shared by every
// nothing-here-yet screen (empty journal, unbuilt edit form, ...). Heading
// level is the caller's call — this card doesn't own page structure.
export function EmptyStateCard({
  icon: Icon,
  heading,
  children,
  action,
}: {
  icon: LucideIcon
  heading: ReactNode
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="border-lm-line bg-lm-surface/40 mx-auto flex max-w-[560px] flex-col items-center gap-4 rounded-xl border-2 border-dashed px-8 py-14 text-center">
      <span className="border-lm-amber/40 text-lm-amber flex size-12 items-center justify-center rounded-full border-2">
        <Icon aria-hidden="true" size={22} />
      </span>
      {heading}
      <p className="text-lm-mist max-w-[360px] text-[14.5px] leading-[1.6]">
        {children}
      </p>
      {action}
    </div>
  )
}
