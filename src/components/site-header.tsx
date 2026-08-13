import { Link } from '@tanstack/react-router'

import { cn } from '#/lib/utils'

// The logo bar shared by every page — public and authenticated. `homeTo`
// picks what the logo links back to; `action` is the right-hand slot
// (sign in / sign out), and its presence decides the header's alignment.
export function SiteHeader({
  homeTo,
  action,
}: {
  homeTo: '/' | '/journal'
  action?: React.ReactNode
}) {
  return (
    <header className="bg-lm-ink/55 border-lm-line/50 border-b backdrop-blur-md backdrop-saturate-150">
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1120px] items-center px-6 py-[26px] max-sm:px-5',
          action ? 'justify-between' : 'justify-center',
        )}
      >
        <Link
          to={homeTo}
          className="text-[15px] font-extrabold tracking-[0.06em] uppercase no-underline max-sm:text-[13px]"
        >
          Movie <span className="text-lm-amber">Journal</span>
        </Link>
        {action}
      </div>
    </header>
  )
}
