import { createFileRoute } from '@tanstack/react-router'
import { ListX } from 'lucide-react'
import { z } from 'zod'

import { getListByShareTokenPrototype } from '#/lib/list-share-prototype/get-list-by-share-token'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { EmptyStateCard } from '#/components/empty-state-card'
import { PrototypeSwitcher } from '#/components/prototype-switcher'
import {
  VariantA,
  variantAName,
} from '#/components/list-share-prototype/variant-a'
import {
  VariantB,
  variantBName,
} from '#/components/list-share-prototype/variant-b'
import {
  VariantC,
  variantCName,
} from '#/components/list-share-prototype/variant-c'

// PROTOTYPE for issue #14 — "What does a signed-out visitor see at a List
// share link?" Three structurally different variants of the List share
// view, switchable via ?variant=, on a throwaway top-level route (no
// `_public.tsx` layout exists yet — see ADR 0015 — so this route lives
// outside `_authed` instead, which already gets the "no session, no auth
// gate" constraint for free). `noindex` is set anyway, matching the real
// route's eventual contract. Throwaway: once a direction is picked, fold
// the winner into the real `_public.lists.$shareToken` route and drop this
// file plus its sibling components under
// src/components/list-share-prototype/.
//
// Data is real: reads the `list`/`list_item`/`movie` tables directly by
// shareToken, no session lookup — exactly what the real route will do.

const searchSchema = z.object({
  variant: z.enum(['A', 'B', 'C']).catch('A'),
})

export const Route = createFileRoute('/list-share-prototype/$shareToken')({
  validateSearch: searchSchema,
  loader: async ({ params }) =>
    getListByShareTokenPrototype({ data: { shareToken: params.shareToken } }),
  head: () => ({
    meta: [
      { title: 'List share prototype — Movie Journal' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: ListSharePrototypePage,
})

const VARIANTS = [
  { key: 'A', name: variantAName },
  { key: 'B', name: variantBName },
  { key: 'C', name: variantCName },
] as const

function ListSharePrototypePage() {
  const list = Route.useLoaderData()
  const { variant } = Route.useSearch()
  const navigate = Route.useNavigate()

  function setVariant(key: string) {
    navigate({ search: { variant: key as 'A' | 'B' | 'C' }, replace: true })
  }

  return (
    <div className="bg-lm-ink font-lm-sans text-lm-paper min-h-screen antialiased">
      <SiteHeader homeTo="/" />
      <main>
        {list ? (
          <>
            {variant === 'A' && <VariantA list={list} />}
            {variant === 'B' && <VariantB list={list} />}
            {variant === 'C' && <VariantC list={list} />}
          </>
        ) : (
          <div className="px-6 py-16">
            <EmptyStateCard
              icon={ListX}
              heading={
                <h1 className="text-[1.3rem] font-extrabold">
                  This share link doesn&rsquo;t lead anywhere
                </h1>
              }
            >
              The list may have been deleted, or the link isn&rsquo;t valid.
            </EmptyStateCard>
          </div>
        )}
      </main>
      <SiteFooter />
      {list && (
        <PrototypeSwitcher
          variants={VARIANTS}
          current={variant}
          onChange={setVariant}
          stateSummary={`films: ${list.items.length}`}
        />
      )}
    </div>
  )
}
