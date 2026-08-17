import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { UserX } from 'lucide-react'
import { z } from 'zod'

import { getPublicJournalPrototype } from '#/lib/journal-public-prototype/get-public-journal'
import {
  journalSearchSchema,
  type JournalSearch,
} from '#/lib/journal/search-params'
import { defaultJournalSort } from '#/lib/journal/sort'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { EmptyStateCard } from '#/components/empty-state-card'
import { PrototypeSwitcher } from '#/components/prototype-switcher'
import {
  VariantA,
  variantAName,
} from '#/components/journal-public-prototype/variant-a'
import {
  VariantB,
  variantBName,
} from '#/components/journal-public-prototype/variant-b'
import {
  VariantC,
  variantCName,
} from '#/components/journal-public-prototype/variant-c'

// PROTOTYPE for issue #14 — "What does a signed-out visitor see at a
// public Journal link?" Three structurally different variants, switchable
// via ?prototypeVariant=, on a throwaway top-level route (no `_public.tsx`
// layout exists yet — see ADR 0015 — so this route lives outside `_authed`
// instead, which already gets the "no session, no auth gate" constraint
// for free). `noindex` is set anyway, matching the real route's eventual
// contract.
//
// `$identifier` stands in for ADR 0015's `$username`: ADR 0014's
// `username` column isn't implemented in code yet, so this looks a user up
// by email instead — a prototype-only stand-in, not a routing decision.
// Data is otherwise real, filtered/sorted server-side exactly like the
// authenticated Journal page, just scoped to the looked-up owner instead
// of the session user.
//
// Throwaway: once a direction is picked, fold the winner into the real
// `_public.journal.$username` route and drop this file plus its sibling
// components under src/components/journal-public-prototype/.

const searchSchema = journalSearchSchema.extend({
  prototypeVariant: z.enum(['A', 'B', 'C']).catch('A'),
})

export const Route = createFileRoute('/journal-public-prototype/$identifier')({
  validateSearch: searchSchema,
  search: {
    middlewares: [stripSearchParams({ sort: defaultJournalSort })],
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ params, deps }) =>
    getPublicJournalPrototype({
      data: { identifier: params.identifier, search: deps.search },
    }),
  head: () => ({
    meta: [
      { title: 'Public journal prototype — Movie Journal' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: PublicJournalPrototypePage,
})

const VARIANTS = [
  { key: 'A', name: variantAName },
  { key: 'B', name: variantBName },
  { key: 'C', name: variantCName },
] as const

function PublicJournalPrototypePage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { prototypeVariant } = search

  function setVariant(key: string) {
    navigate({
      search: (prev) => ({ ...prev, prototypeVariant: key as 'A' | 'B' | 'C' }),
      replace: true,
    })
  }

  function onFilterChange<K extends keyof JournalSearch>(
    field: K,
    value: JournalSearch[K],
  ) {
    navigate({
      search: (prev) => ({ ...prev, [field]: value }),
      replace: true,
    })
  }

  return (
    <div className="bg-lm-ink font-lm-sans text-lm-paper min-h-screen antialiased">
      <SiteHeader homeTo="/" />
      <main>
        {data ? (
          <>
            {prototypeVariant === 'A' && (
              <VariantA
                data={data}
                search={search}
                onFilterChange={onFilterChange}
              />
            )}
            {prototypeVariant === 'B' && (
              <VariantB
                data={data}
                search={search}
                onFilterChange={onFilterChange}
              />
            )}
            {prototypeVariant === 'C' && (
              <VariantC
                data={data}
                search={search}
                onFilterChange={onFilterChange}
              />
            )}
          </>
        ) : (
          <div className="px-6 py-16">
            <EmptyStateCard
              icon={UserX}
              heading={
                <h1 className="text-[1.3rem] font-extrabold">
                  No public journal here
                </h1>
              }
            >
              This link doesn&rsquo;t match anyone&rsquo;s public journal.
            </EmptyStateCard>
          </div>
        )}
      </main>
      <SiteFooter />
      {data && (
        <PrototypeSwitcher
          variants={VARIANTS}
          current={prototypeVariant}
          onChange={setVariant}
          stateSummary={`films: ${data.entries.length}/${data.stats.totalCount}`}
        />
      )}
    </div>
  )
}
