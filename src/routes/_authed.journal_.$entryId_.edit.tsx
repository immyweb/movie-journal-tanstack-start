import { createFileRoute, Link } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'

import { EmptyStateCard } from '#/components/empty-state-card'

// Stub only — exists so the film detail page's Edit link has a real, typed
// route to point at. The actual edit form is a separate piece of work.
export const Route = createFileRoute('/_authed/journal_/$entryId_/edit')({
  head: () => ({
    meta: [{ title: 'Edit — Movie Journal' }],
  }),
  component: EditEntryStub,
})

function EditEntryStub() {
  const { entryId } = Route.useParams()

  return (
    <section className="px-6 pt-[52px] pb-16">
      <EmptyStateCard
        icon={Ticket}
        heading={
          <h1 className="text-[1.3rem] font-extrabold">
            Editing isn&rsquo;t wired up yet
          </h1>
        }
        action={
          <Link
            to="/journal/$entryId"
            params={{ entryId }}
            className="text-lm-amber font-lm-mono mt-2 cursor-pointer text-xs tracking-[0.08em] uppercase underline underline-offset-4"
          >
            Back to stub
          </Link>
        }
      >
        You&rsquo;ll be able to update this stub&rsquo;s rating, review, and
        watch date here soon.
      </EmptyStateCard>
    </section>
  )
}
