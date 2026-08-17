import { useEffect } from 'react'

// PROTOTYPE for issue #12 — see src/routes/_authed.settings-prototype.tsx.

export type PrototypeVariant = { key: string; name: string }

export function PrototypeSwitcher({
  variants,
  current,
  onChange,
  stateSummary,
}: {
  variants: readonly PrototypeVariant[]
  current: string
  onChange: (key: string) => void
  stateSummary: string
}) {
  const index = variants.findIndex((v) => v.key === current)
  const active = variants[index]

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
      if (target?.isContentEditable) return

      if (e.key === 'ArrowLeft') {
        onChange(variants[(index - 1 + variants.length) % variants.length].key)
      } else if (e.key === 'ArrowRight') {
        onChange(variants[(index + 1) % variants.length].key)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [variants, index, onChange])

  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-1 rounded-2xl border-2 border-amber-400 bg-black/90 px-4 py-2.5 text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            onChange(
              variants[(index - 1 + variants.length) % variants.length].key,
            )
          }
          className="cursor-pointer rounded-full px-2 py-1 text-lg leading-none hover:bg-white/10"
          aria-label="Previous variant"
        >
          ←
        </button>
        <span className="font-mono text-xs tracking-wide">
          {active.key} — {active.name}
        </span>
        <button
          type="button"
          onClick={() => onChange(variants[(index + 1) % variants.length].key)}
          className="cursor-pointer rounded-full px-2 py-1 text-lg leading-none hover:bg-white/10"
          aria-label="Next variant"
        >
          →
        </button>
      </div>
      <div className="font-mono text-[10px] tracking-wide text-white/60">
        {stateSummary}
      </div>
    </div>
  )
}
