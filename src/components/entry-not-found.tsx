import { Film } from 'lucide-react'

import { EmptyStateCard } from '#/components/empty-state-card'
import { TicketLink } from '#/components/ticket-button'

// Shared by every journal-entry route that throws notFound() — the entry
// either doesn't exist or belongs to another user, and both routes want the
// same message rather than the router's generic default.
export function EntryNotFound() {
  return (
    <section className="px-6 pt-6 pb-16">
      <EmptyStateCard
        icon={Film}
        heading={
          <h1 className="text-[1.3rem] font-extrabold">Entry not found</h1>
        }
        action={
          <TicketLink to="/journal" className="mt-2">
            Back to journal
          </TicketLink>
        }
      >
        This entry doesn&rsquo;t exist, or isn&rsquo;t yours to see.
      </EmptyStateCard>
    </section>
  )
}
