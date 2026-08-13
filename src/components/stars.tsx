export function Stars({ rating }: { rating: number | null }) {
  if (rating == null) {
    return (
      <span className="text-lm-mist font-lm-mono text-xs tracking-[0.04em] uppercase">
        Not rated
      </span>
    )
  }

  return (
    <span
      className="text-lm-amber text-sm tracking-[2px]"
      aria-label={`${rating} out of 5 stars`}
    >
      {'★'.repeat(rating)}
      <span className="text-[#4a4b5c]">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}
