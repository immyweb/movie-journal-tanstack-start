import { Film, Heart } from 'lucide-react'

import { Stars } from '#/components/stars'
import { cn } from '#/lib/utils'

// The torn admission-ticket card — one per watched film. Shared between the
// homepage showcase and the journal grid, which both render the same shape.
export function MovieStub({
  title,
  subtitle,
  posterUrl,
  rating,
  liked,
  review,
  dateWatchedLabel,
}: {
  title: string
  subtitle: string
  posterUrl: string | null
  rating: number | null
  liked: boolean
  review: string | null
  dateWatchedLabel: string
}) {
  return (
    <article className="border-lm-line bg-lm-surface relative flex h-full flex-row items-stretch overflow-hidden rounded-xl border">
      <div className="bg-lm-surface after:[background-image:linear-gradient(to_right,transparent_65%,var(--color-lm-surface)_100%)] relative w-[104px] shrink-0 after:absolute after:inset-0 after:content-['']">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className="block h-full w-full object-cover [filter:saturate(1.05)_contrast(1.03)]"
          />
        ) : (
          <div className="text-lm-mist flex h-full w-full items-center justify-center">
            <Film aria-hidden="true" size={28} />
          </div>
        )}
      </div>
      <div
        aria-hidden="true"
        className="border-lm-line before:bg-lm-ink after:bg-lm-ink relative my-3.5 w-0 shrink-0 border-l-2 border-dashed before:absolute before:-left-2 before:top-[-8px] before:size-4 before:rounded-full before:content-[''] after:absolute after:-left-2 after:bottom-[-8px] after:size-4 after:rounded-full after:content-['']"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-col gap-2 px-[18px] pt-4 pb-2.5">
          <div className="text-[17px] leading-[1.25] font-extrabold">
            {title}
          </div>
          <div className="text-lm-mist text-[13px]">{subtitle}</div>
        </div>
        <div className="flex items-center justify-between gap-2 px-[18px] pb-2.5">
          <Stars rating={rating} />
          {/* Always takes up its size-7 slot, just invisible when not
              liked — otherwise the badge's extra height only shows up on
              liked entries, and CSS Grid's per-row stretch turns that into
              a height mismatch between rows depending on which happen to
              contain a liked film. */}
          <span
            aria-label={liked ? 'Liked' : undefined}
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full',
              liked ? 'bg-lm-red/16 text-[#e77b90]' : 'invisible',
            )}
          >
            <Heart aria-hidden="true" size={14} className="fill-current" />
          </span>
        </div>
        {/* Fixed-height slot (~3 clamped lines) regardless of whether a
            review exists — otherwise CSS Grid's per-row stretch leaves
            rows with no long reviews visibly shorter than rows that have
            one, since each row is sized independently. */}
        <div className="min-h-[79px] px-[18px] pb-[18px]">
          {review && (
            <p className="text-lm-mist line-clamp-3 text-[13.5px] leading-[1.5] italic">
              &ldquo;{review}&rdquo;
            </p>
          )}
        </div>
        <div className="font-lm-mono text-lm-mist mt-auto px-[18px] pb-4 text-[11.5px] tracking-[0.04em]">
          WATCHED {dateWatchedLabel}
        </div>
      </div>
    </article>
  )
}
