import { Film } from 'lucide-react'

import { cn } from '#/lib/utils'

// Poster image or Film-icon fallback, in a caller-sized/shaped box — the
// pattern independently hand-rolled in the lists card grid, both picker
// panes of the manage overlay, and the public share page (issue #20,
// finding 6). Box sizing, aspect ratio, rounding, border, and background
// vary per call site and stay caller-owned via `className`; `imageClassName`
// is separate so a hover effect (e.g. the share page's scale-on-hover) can
// target the `<img>` alone without affecting the fallback icon.
export function PosterThumbnail({
  posterUrl,
  alt,
  iconSize = 20,
  className,
  imageClassName,
}: {
  posterUrl: string | null
  alt: string
  iconSize?: number
  className?: string
  imageClassName?: string
}) {
  // A <span>, not a <div> — one call site (the picker's search-result row)
  // nests this inside a <button>, where a div isn't valid phrasing content.
  // The `flex` utility below makes the tag choice invisible to layout.
  return (
    <span
      className={cn(
        'flex items-center justify-center overflow-hidden',
        className,
      )}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={alt}
          className={cn('h-full w-full object-cover', imageClassName)}
        />
      ) : (
        <Film aria-hidden="true" size={iconSize} className="text-lm-mist" />
      )}
    </span>
  )
}
