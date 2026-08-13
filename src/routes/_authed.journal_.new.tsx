import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/journal_/new')({
  head: () => ({
    meta: [{ title: 'Log a film — Movie Journal' }],
  }),
  component: NewEntryPage,
})

// Placeholder for the add-movie flow (TMDB search, rate, review) — a
// separate piece of work from the journal list itself.
function NewEntryPage() {
  return (
    <section className="flex flex-col items-center gap-3 px-6 py-24 text-center">
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
    </section>
  )
}
