import { cn } from '#/lib/utils'

// The row of flickering marquee bulbs under the header — shared between the
// homepage and the journal, the two "front of house" screens of the app.
export function MarqueeBulbs() {
  return (
    <div className="flex justify-center gap-3.5 pt-2 pb-1.5" aria-hidden="true">
      {Array.from({ length: 11 }).map((_, i) => {
        const isRed = (i + 1) % 3 === 0
        return (
          <span
            key={i}
            style={{ animationDelay: `${(i % 5) * 0.5}s` }}
            className={cn(
              'motion-safe:animate-lm-flicker size-1.5 rounded-full',
              isRed
                ? 'bg-lm-red shadow-[0_0_6px_2px_rgba(197,64,90,0.5)]'
                : 'bg-lm-amber shadow-[0_0_6px_2px_rgba(242,169,59,0.55)]',
            )}
          />
        )
      })}
    </div>
  )
}
