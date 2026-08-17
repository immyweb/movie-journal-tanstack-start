import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { useSettingsPrototypeState } from '#/components/settings-prototype/state'
import { PrototypeSwitcher } from '#/components/settings-prototype/switcher'
import {
  VariantA,
  variantAName,
} from '#/components/settings-prototype/variant-a'
import {
  VariantB,
  variantBName,
} from '#/components/settings-prototype/variant-b'
import {
  VariantC,
  variantCName,
} from '#/components/settings-prototype/variant-c'

// PROTOTYPE for issue #12 — three structurally different takes on the
// account/settings page (public-Journal toggle + username entry), switchable
// via ?variant=. Throwaway: once a direction is picked, fold the winner into
// a real `/settings` route and drop this file plus its sibling components
// under src/components/settings-prototype/.

const searchSchema = z.object({
  variant: z.enum(['A', 'B', 'C']).catch('A'),
})

export const Route = createFileRoute('/_authed/settings-prototype')({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: 'Settings prototype — Movie Journal' }],
  }),
  component: SettingsPrototypePage,
})

const VARIANTS = [
  { key: 'A', name: variantAName },
  { key: 'B', name: variantBName },
  { key: 'C', name: variantCName },
] as const

function SettingsPrototypePage() {
  const { variant } = Route.useSearch()
  const navigate = Route.useNavigate()
  const state = useSettingsPrototypeState()

  function setVariant(key: string) {
    navigate({
      search: { variant: key as 'A' | 'B' | 'C' },
      replace: true,
    })
  }

  return (
    <>
      {variant === 'A' && <VariantA state={state} />}
      {variant === 'B' && <VariantB state={state} />}
      {variant === 'C' && <VariantC state={state} />}
      <PrototypeSwitcher
        variants={VARIANTS}
        current={variant}
        onChange={setVariant}
        stateSummary={`username: ${state.username ?? '(none)'} · public: ${state.journalIsPublic ? 'yes' : 'no'}`}
      />
    </>
  )
}
