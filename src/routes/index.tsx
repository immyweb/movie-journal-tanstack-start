import { Link, createFileRoute } from '@tanstack/react-router'

import { getShowcaseFilms } from '#/lib/tmdb/showcase'
import { Tear } from '#/components/tear-divider'
import { TicketLink } from '#/components/ticket-button'
import { MarqueeBulbs } from '#/components/marquee-bulbs'
import { MovieStub } from '#/components/movie-stub'

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

      <MarqueeBulbs />

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
            <MovieStub
              key={film.tmdbId}
              title={film.title}
              subtitle={`${film.year} · ${film.country}`}
              posterUrl={film.posterUrl}
              rating={film.rating}
              liked={film.liked}
              review={film.review}
              dateWatchedLabel={film.dateWatched.toUpperCase()}
            />
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
