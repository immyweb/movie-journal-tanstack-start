import { cn } from '#/lib/utils'

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
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected === option.value}
            onClick={() =>
              onChange(
                option.value === 'all' ? undefined : option.value === 'true',
              )
            }
            className={cn(
              'focus-visible:outline-lm-amber cursor-pointer rounded-full px-[14px] py-2 text-xs font-bold tracking-[0.05em] outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
              selected === option.value
                ? 'bg-lm-amber text-[#1c1408]'
                : 'bg-lm-mist/14 text-[#9698aa] hover:bg-lm-mist/22',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
