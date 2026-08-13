import { Film } from 'lucide-react'

import { cn } from '#/lib/utils'
import { Stars } from '#/components/stars'

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
    <article className="border-lm-line bg-lm-surface relative flex flex-row items-stretch overflow-hidden rounded-xl border">
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
          <span
            className={cn(
              'rounded-full px-[9px] py-1 text-xs font-bold tracking-[0.05em]',
              liked
                ? 'bg-lm-red/16 text-[#e77b90]'
                : 'bg-lm-mist/14 text-lm-mist',
            )}
          >
            {liked ? 'Liked' : 'Not liked'}
          </span>
        </div>
        {review && (
          <p className="text-lm-mist px-[18px] pb-[18px] text-[13.5px] leading-[1.5] italic">
            &ldquo;{review}&rdquo;
          </p>
        )}
        <div className="font-lm-mono mt-auto px-[18px] pb-4 text-[11.5px] tracking-[0.04em] text-[#5f6178]">
          WATCHED {dateWatchedLabel}
        </div>
      </div>
    </article>
  )
}
