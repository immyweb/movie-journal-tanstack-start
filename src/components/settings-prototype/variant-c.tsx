import { useState } from 'react'

import { AuthField } from '#/components/auth-field'
import {
  TicketSubmitButton,
  ticketButtonClass,
} from '#/components/ticket-button'
import { Tear } from '#/components/tear-divider'
import type { SettingsPrototypeState } from './state'

// PROTOTYPE for issue #12 — see src/routes/_authed.settings-prototype.tsx.
//
// Publish CTA: no fields on screen at all until the user commits to
// publishing. No toggle exists even once public — reverting is a plain text
// action, not a switch — the most button/step-driven of the three takes.

export const variantCName = 'Publish CTA'

export function VariantC({ state }: { state: SettingsPrototypeState }) {
  const { username, journalIsPublic, claimAndPublish, setPublic } = state
  const [step, setStep] = useState<'idle' | 'claiming'>('idle')
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handlePublishClick() {
    if (username) {
      setPublic(true)
      return
    }
    setStep('claiming')
  }

  function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = claimAndPublish(draft)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setStep('idle')
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
        <div className="mx-auto max-w-[480px] text-center">
          {journalIsPublic ? (
            <div className="border-lm-line bg-lm-surface rounded-xl border p-6">
              <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
                Now showing
              </div>
              <p className="mt-3 text-lg font-extrabold">
                Your Journal is public
              </p>
              <code className="text-lm-mist mt-2 block text-sm">
                /journal/{username}
              </code>
              <button
                type="button"
                onClick={() => setPublic(false)}
                className="text-lm-amber font-lm-mono mt-4 cursor-pointer text-xs tracking-[0.08em] uppercase underline underline-offset-4"
              >
                Make private
              </button>
            </div>
          ) : step === 'idle' ? (
            <button
              type="button"
              onClick={handlePublishClick}
              className={ticketButtonClass}
            >
              Publish your Journal
            </button>
          ) : (
            <form
              onSubmit={handleClaimSubmit}
              className="border-lm-line bg-lm-surface space-y-3 rounded-xl border p-6 text-left"
              noValidate
            >
              <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
                Claim your ticket ID
              </div>
              <p className="text-lm-mist text-sm">
                This becomes your Journal's public username — set it to finish
                publishing.
              </p>
              <AuthField
                id="username-c"
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
                  onClick={() => setStep('idle')}
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
