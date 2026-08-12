import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/journal')({
  head: () => ({
    meta: [{ title: 'Journal — Movie Journal' }],
  }),
  component: JournalPage,
})

// Placeholder landing spot for the Register/Sign-in redirect — the real
// journal page (list, filters, entries) is a separate piece of work.
function JournalPage() {
  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-xl font-bold">Your journal is coming soon</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          You're signed in — this is where your watched movies will live.
        </p>
      </div>
    </div>
  )
}
