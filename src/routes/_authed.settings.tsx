import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Switch } from 'radix-ui'
import { Unlock } from 'lucide-react'

import { getSettings } from '#/lib/settings/get-settings'
import { saveUsername } from '#/lib/settings/save-username'
import { setJournalPublic } from '#/lib/settings/set-journal-public'
import {
  saveUsernameSchema,
  type SaveUsernameInput,
} from '#/lib/validation/settings'
import { cn } from '#/lib/utils'
import { AuthField } from '#/components/auth-field'
import { ErrorBanner } from '#/components/error-banner'
import { TicketSubmitButton } from '#/components/ticket-button'
import { Tear } from '#/components/tear-divider'

// Settings page (issue #18) — winning variant A, "stacked form", from
// prototype/settings-page-issue-12: username is saved via its own action,
// independent of the publish toggle, which stays disabled with a caption
// until a username exists (ADR 0014's invariant).
export const Route = createFileRoute('/_authed/settings')({
  loader: () => getSettings(),
  head: () => ({
    meta: [{ title: 'Settings — Movie Journal' }],
  }),
  component: SettingsPage,
})

function SettingsPage() {
  const initial = Route.useLoaderData()
  const router = useRouter()

  const [username, setUsername] = useState(initial.username)
  const [journalIsPublic, setJournalIsPublicState] = useState(
    initial.journalIsPublic,
  )
  const [saveError, setSaveError] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [isTogglePending, setIsTogglePending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SaveUsernameInput>({
    resolver: zodResolver(saveUsernameSchema),
    defaultValues: { username: initial.username ?? '' },
  })

  // Invalidation runs after the write already succeeded — a failure here
  // must not be reported as the mutation itself having failed.
  const refreshAfterMutation = async () => {
    try {
      await router.invalidate()
    } catch {
      // Stale until the next interaction re-triggers a load.
    }
  }

  const onSaveUsername = async (values: SaveUsernameInput) => {
    setSaveError(null)

    try {
      await saveUsername({ data: values })
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Could not save that username. Please try again.',
      )
      return
    }

    setUsername(values.username)
    await refreshAfterMutation()
  }

  const handleTogglePublic = async (next: boolean) => {
    setToggleError(null)
    setIsTogglePending(true)

    try {
      await setJournalPublic({ data: { journalIsPublic: next } })
    } catch (error) {
      setToggleError(
        error instanceof Error
          ? error.message
          : 'Could not update this setting. Please try again.',
      )
      setIsTogglePending(false)
      return
    }

    setJournalIsPublicState(next)
    setIsTogglePending(false)
    await refreshAfterMutation()
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
        <p className="text-lm-mist mx-auto max-w-[520px] text-[1.05rem] leading-[1.6]">
          Pick a username, then decide whether anyone with the link can see your
          Journal.
        </p>
      </section>

      <Tear />

      <section className="px-6 pt-[52px] pb-16">
        <div className="border-lm-line bg-lm-surface mx-auto max-w-[560px] rounded-xl border p-6">
          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSaveUsername)}
            noValidate
          >
            <AuthField
              id="username"
              label="Username"
              placeholder="e.g. film_fan_92"
              error={errors.username?.message}
              {...register('username')}
            />
            {saveError && <ErrorBanner>{saveError}</ErrorBanner>}
            <TicketSubmitButton className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save username'}
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
              <Switch.Root
                aria-label="Publish Journal"
                checked={journalIsPublic}
                disabled={!username || isTogglePending}
                onCheckedChange={handleTogglePublic}
                className={cn(
                  'relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                  journalIsPublic ? 'bg-lm-amber' : 'bg-lm-mist/30',
                )}
              >
                <Switch.Thumb
                  className={cn(
                    'bg-lm-ink block size-6 rounded-full transition-transform',
                    journalIsPublic ? 'translate-x-[22px]' : 'translate-x-0.5',
                  )}
                />
              </Switch.Root>
            </div>

            {toggleError && (
              <div className="mt-4">
                <ErrorBanner>{toggleError}</ErrorBanner>
              </div>
            )}

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
