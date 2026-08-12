import { Link, createFileRoute } from '@tanstack/react-router'
import { Film } from 'lucide-react'

import { getShowcaseFilms } from '#/lib/tmdb/showcase'
import { cn } from '#/lib/utils'
import { Tear } from '#/components/tear-divider'
import { TicketLink } from '#/components/ticket-button'

export const Route = createFileRoute('/')({
  loader: () => getShowcaseFilms(),
  head: () => ({
    meta: [
      {
        title: 'Movie Journal — log every film you watch',
      },
      {
        name: 'description',
        content:
          'Log every film you watch, rate it, and write down what you thought — a running record of your moviegoing life, kept in one place.',
      },
    ],
  }),
  component: Home,
})

function Stars({ rating }: { rating: number }) {
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

function Home() {
  const films = Route.useLoaderData()

  return (
    <div className="bg-lm-ink font-lm-sans text-lm-paper min-h-screen antialiased">
      <header className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-[26px] max-sm:px-5">
        <div className="text-[15px] font-extrabold tracking-[0.06em] uppercase max-sm:text-[13px]">
          Movie <span className="text-lm-amber">Journal</span>
        </div>
        <Link
          to="/sign-in"
          className="border-lm-line text-lm-paper hover:border-lm-amber hover:bg-lm-amber/10 focus-visible:outline-lm-amber rounded-full border px-4 py-2 text-sm no-underline outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Sign in
        </Link>
      </header>

      <div
        className="flex justify-center gap-3.5 pt-2 pb-1.5"
        aria-hidden="true"
      >
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

      <section className="px-6 pt-6 pb-16 text-center">
        <h1 className="mb-[22px] text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.02] font-black tracking-[-0.01em] text-balance uppercase">
          Now showing:
          <br />
          your{' '}
          <em className="text-lm-amber not-italic [text-shadow:0_0_28px_rgba(242,169,59,0.35)]">
            watch
          </em>{' '}
          history
        </h1>
        <p className="text-lm-mist mx-auto mb-[34px] max-w-[520px] text-[1.08rem] leading-[1.6]">
          Log every film you watch, rate it, and write down what you thought — a
          running record of your moviegoing life, kept in one place.
        </p>
        <TicketLink to="/register">Start your journal</TicketLink>
        <div className="font-lm-mono text-lm-mist mt-4 text-[12.5px] tracking-[0.04em]">
          NO CARD REQUIRED · TAKES 30 SECONDS
        </div>
      </section>

      <Tear />

      <section className="px-6 pt-[60px] pb-5">
        <div className="mx-auto mb-[30px] max-w-[1120px]">
          <div className="text-lm-amber text-xs font-bold tracking-[0.14em] uppercase">
            Admit one
          </div>
          <h2 className="mt-2.5 mb-2 text-[clamp(1.5rem,3vw,2.1rem)] font-extrabold">
            Every film gets its own stub
          </h2>
          <p className="text-lm-mist max-w-[520px] leading-[1.6]">
            Rate it, say whether you liked it, write a line while it's fresh.
            Rewatch something? It gets a new stub — your first watch stays
            exactly as you left it.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1120px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[22px]">
          {films.map((film) => (
            <article
              className="border-lm-line bg-lm-surface relative flex flex-row items-stretch overflow-hidden rounded-xl border"
              key={film.tmdbId}
            >
              <div className="bg-lm-surface after:[background-image:linear-gradient(to_right,transparent_65%,var(--color-lm-surface)_100%)] relative w-[104px] shrink-0 after:absolute after:inset-0 after:content-['']">
                {film.posterUrl ? (
                  <img
                    src={film.posterUrl}
                    alt={`${film.title} poster`}
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
                    {film.title}
                  </div>
                  <div className="text-lm-mist text-[13px]">
                    {film.year} · {film.country}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-[18px] pb-2.5">
                  <Stars rating={film.rating} />
                  <span
                    className={cn(
                      'rounded-full px-[9px] py-1 text-xs font-bold tracking-[0.05em]',
                      film.liked
                        ? 'bg-lm-red/16 text-[#e77b90]'
                        : 'bg-lm-mist/14 text-lm-mist',
                    )}
                  >
                    {film.liked ? 'Liked' : 'Not liked'}
                  </span>
                </div>
                <p className="text-lm-mist px-[18px] pb-[18px] text-[13.5px] leading-[1.5] italic">
                  &ldquo;{film.review}&rdquo;
                </p>
                <div className="font-lm-mono mt-auto px-[18px] pb-4 text-[11.5px] tracking-[0.04em] text-[#5f6178]">
                  WATCHED {film.dateWatched.toUpperCase()}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Tear />

      <section className="px-6 pt-20 pb-10 text-center">
        <h3 className="mb-5 text-[clamp(1.6rem,3.4vw,2.4rem)] font-extrabold">
          Your next stub is waiting.
        </h3>
        <TicketLink to="/register">Start your journal</TicketLink>
      </section>

      <footer className="px-6 pt-7 pb-10 text-center text-[12.5px] text-[#565870]">
        Movie Journal — a personal log for what you watch.
      </footer>
    </div>
  )
}
