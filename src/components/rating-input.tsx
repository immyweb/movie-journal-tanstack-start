import { cn } from '#/lib/utils'

const STAR_VALUES = [1, 2, 3, 4, 5] as const

export function RatingInput({
  value,
  onChange,
}: {
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div role="radiogroup" aria-label="Rating" className="flex gap-1">
        {STAR_VALUES.map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => onChange(star)}
            className="focus-visible:outline-lm-amber cursor-pointer rounded text-2xl leading-none outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <span
              className={cn(
                value != null && star <= value
                  ? 'text-lm-amber'
                  : 'text-[#4a4b5c]',
              )}
            >
              ★
            </span>
          </button>
        ))}
      </div>

      {value != null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-lm-mist font-lm-mono cursor-pointer text-xs tracking-[0.08em] uppercase underline underline-offset-4"
        >
          Clear
        </button>
      )}
    </div>
  )
}
