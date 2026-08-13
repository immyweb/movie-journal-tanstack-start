export function Stars({
  rating,
  size = 'sm',
}: {
  rating: number | null
  size?: 'sm' | 'lg'
}) {
  if (rating == null) {
    return (
      <span
        className={
          size === 'lg'
            ? 'text-lm-mist font-lm-mono text-sm tracking-[0.08em] uppercase'
            : 'text-lm-mist font-lm-mono text-xs tracking-[0.04em] uppercase'
        }
      >
        Not rated
      </span>
    )
  }

  return (
    <span
      className={
        size === 'lg'
          ? 'text-lm-amber [text-shadow:0_0_22px_rgba(242,169,59,0.55)] text-[2rem] leading-none tracking-[5px]'
          : 'text-lm-amber text-sm tracking-[2px]'
      }
      aria-label={`${rating} out of 5 stars`}
    >
      {'★'.repeat(rating)}
      <span className="text-[#4a4b5c]">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}
