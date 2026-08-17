import { useState } from 'react'
import { Unlock } from 'lucide-react'

import { cn } from '#/lib/utils'
import { AuthField } from '#/components/auth-field'
import { TicketSubmitButton } from '#/components/ticket-button'
import { Tear } from '#/components/tear-divider'
import type { SettingsPrototypeState } from './state'

// PROTOTYPE for issue #12 — see src/routes/_authed.settings-prototype.tsx.
//
// Stacked form: username is always visible and saved on its own, and the
// publish toggle is simply disabled with an explanatory caption until a
// username exists. The "prerequisite" read of the invariant — deliberately
// included as one of three takes, not a claim it's the right one.

export const variantAName = 'Stacked form'

export function VariantA({ state }: { state: SettingsPrototypeState }) {
  const { username, journalIsPublic, claimUsername, setPublic } = state
  const [draft, setDraft] = useState(username ?? '')
  const [error, setError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  function handleSaveUsername(e: React.FormEvent) {
    e.preventDefault()
    const err = claimUsername(draft)
    if (err) {
      setError(err)
      setJustSaved(false)
      return
    }
    setError(null)
    setJustSaved(true)
  }

  const isUpToDate = justSaved && draft === username

  return (
    <>
      <section className="px-6 pt-6 pb-10 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Account
        </div>
        <h1 className="mt-2.5 mb-[14px] text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          Your public Journal
        </h1>
        <p className="text-lm-mist mx-auto max-w-[520px] text-[1.05rem] leading-[1.6]">
          Pick a username, then decide whether anyone with the link can see your
          Journal.
        </p>
      </section>

      <Tear />

      <section className="px-6 pt-[52px] pb-16">
        <div className="border-lm-line bg-lm-surface mx-auto max-w-[560px] rounded-xl border p-6">
          <form className="space-y-4" onSubmit={handleSaveUsername} noValidate>
            <AuthField
              id="username-a"
              label="Username"
              placeholder="e.g. film_fan_92"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                setJustSaved(false)
              }}
              error={error ?? undefined}
            />
            <TicketSubmitButton className="w-full" disabled={isUpToDate}>
              {isUpToDate ? 'Saved' : 'Save username'}
            </TicketSubmitButton>
          </form>

          <div className="border-lm-line mt-6 border-t pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[15px] font-bold">Publish Journal</div>
                <p className="text-lm-mist mt-1 text-sm">
                  {username
                    ? 'Anyone with your link can view your full Journal.'
                    : 'Set a username above to publish your Journal.'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={journalIsPublic}
                disabled={!username}
                onClick={() => setPublic(!journalIsPublic)}
                className={cn(
                  'relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                  journalIsPublic ? 'bg-lm-amber' : 'bg-lm-mist/30',
                )}
              >
                <span
                  className={cn(
                    'bg-lm-ink absolute top-0.5 size-6 rounded-full transition-transform',
                    journalIsPublic ? 'translate-x-[22px]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>

            {journalIsPublic && username && (
              <div className="border-lm-line bg-lm-ink mt-4 flex items-center gap-2 rounded-md border px-3 py-2">
                <Unlock
                  aria-hidden="true"
                  size={14}
                  className="text-lm-amber shrink-0"
                />
                <code className="text-lm-paper truncate text-sm">
                  /journal/{username}
                </code>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
