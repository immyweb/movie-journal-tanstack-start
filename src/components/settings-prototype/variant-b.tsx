import { useState } from 'react'

import { cn } from '#/lib/utils'
import { AuthField } from '#/components/auth-field'
import { TicketSubmitButton } from '#/components/ticket-button'
import { Tear } from '#/components/tear-divider'
import type { SettingsPrototypeState } from './state'

// PROTOTYPE for issue #12 — see src/routes/_authed.settings-prototype.tsx.
//
// Status marquee: a big illuminated PUBLIC/PRIVATE sign is the primary
// affordance. Clicking it with no username expands an inline claim form
// right there, in the same click — the invariant realized as progressive
// disclosure rather than a pre-disabled control (contrast with Variant A).

export const variantBName = 'Status marquee'

export function VariantB({ state }: { state: SettingsPrototypeState }) {
  const { username, journalIsPublic, claimAndPublish, setPublic } = state
  const [claiming, setClaiming] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handlePrimaryClick() {
    if (journalIsPublic) {
      setPublic(false)
      return
    }
    if (username) {
      setPublic(true)
      return
    }
    setClaiming(true)
  }

  function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = claimAndPublish(draft)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setClaiming(false)
  }

  return (
    <>
      <section className="px-6 pt-6 pb-10 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Account
        </div>
        <h1 className="mt-2.5 mb-[14px] text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          Your public Journal
        </h1>
      </section>

      <Tear />

      <section className="px-6 pt-[52px] pb-16">
        <div className="mx-auto max-w-[560px]">
          <div
            className={cn(
              'rounded-xl border-2 px-6 py-10 text-center transition-colors',
              journalIsPublic
                ? 'border-lm-amber/50 bg-lm-amber/10'
                : 'border-lm-line bg-lm-surface',
            )}
          >
            <span
              className={cn(
                'font-lm-mono inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.14em] uppercase',
                journalIsPublic
                  ? 'bg-lm-amber text-[#1c1408]'
                  : 'bg-lm-mist/20 text-lm-mist',
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  journalIsPublic
                    ? 'motion-safe:animate-lm-flicker bg-[#1c1408]'
                    : 'bg-lm-mist',
                )}
              />
              {journalIsPublic ? 'Public' : 'Private'}
            </span>

            <p className="text-lm-mist mt-4 text-sm">
              {journalIsPublic
                ? `Live at /journal/${username}`
                : 'Only you can see your Journal right now.'}
            </p>

            <button
              type="button"
              onClick={handlePrimaryClick}
              className={cn(
                'mt-6 cursor-pointer rounded-full border px-6 py-2.5 text-sm font-bold transition-colors',
                journalIsPublic
                  ? 'border-lm-line text-lm-paper hover:border-lm-amber hover:bg-lm-amber/10'
                  : 'border-lm-amber bg-lm-amber text-[#1c1408] hover:-translate-y-px',
              )}
            >
              {journalIsPublic ? 'Take it private' : 'Publish Journal'}
            </button>
          </div>

          {claiming && !journalIsPublic && (
            <form
              onSubmit={handleClaimSubmit}
              className="border-lm-line bg-lm-surface mt-4 space-y-3 rounded-xl border p-5"
              noValidate
            >
              <p className="text-lm-mist text-sm">
                Choose a username first — it becomes part of your Journal's
                public link.
              </p>
              <AuthField
                id="username-b"
                label="Username"
                placeholder="e.g. film_fan_92"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                error={error ?? undefined}
              />
              <div className="flex items-center gap-4">
                <TicketSubmitButton>Claim & publish</TicketSubmitButton>
                <button
                  type="button"
                  onClick={() => setClaiming(false)}
                  className="text-lm-mist font-lm-mono cursor-pointer text-xs tracking-[0.08em] uppercase underline underline-offset-4"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
