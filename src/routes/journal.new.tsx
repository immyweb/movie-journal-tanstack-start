import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import { getSession } from '#/lib/auth/functions'
import { Tear } from '#/components/tear-divider'

export const Route = createFileRoute('/journal/new')({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      throw redirect({ to: '/sign-in' })
    }
  },
  head: () => ({
    meta: [{ title: 'Log a film — Movie Journal' }],
  }),
  component: NewEntryPage,
})

// Placeholder for the add-movie flow (TMDB search, rate, review) — a
// separate piece of work from the journal list itself.
function NewEntryPage() {
  return (
    <div className="bg-lm-ink font-lm-sans text-lm-paper flex min-h-screen flex-col antialiased">
      <header className="mx-auto flex w-full max-w-[1120px] justify-center px-6 py-[26px] max-sm:px-5">
        <Link
          to="/journal"
          className="text-[15px] font-extrabold tracking-[0.06em] uppercase no-underline max-sm:text-[13px]"
        >
          Movie <span className="text-lm-amber">Journal</span>
        </Link>
      </header>

      <Tear />

      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-14 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Coming soon
        </div>
        <h1 className="text-[clamp(1.7rem,4vw,2.2rem)] font-extrabold">
          Logging a film is next
        </h1>
        <p className="text-lm-mist max-w-[420px] text-[15px] leading-[1.6]">
          Search, rate, and review — this stub isn&rsquo;t cut yet. Come back to
          your{' '}
          <Link
            to="/journal"
            className="text-lm-amber underline underline-offset-4"
          >
            journal
          </Link>{' '}
          in the meantime.
        </p>
      </main>
    </div>
  )
}
