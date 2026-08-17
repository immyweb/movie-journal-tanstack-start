import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'

import { createList } from '#/lib/lists/create-list'
import { AuthField } from '#/components/auth-field'
import { TextareaField } from '#/components/textarea-field'
import { ErrorBanner } from '#/components/error-banner'
import { OverlayShell } from '#/components/lists/overlay-shell'

export function CreateListOverlay({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (listId: string) => void
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Give your list a name.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    let created: Awaited<ReturnType<typeof createList>>
    try {
      created = await createList({
        data: {
          name: trimmedName,
          description: description.trim() ? description.trim() : null,
        },
      })
    } catch {
      setError('Something went wrong creating this list. Please try again.')
      setIsSubmitting(false)
      return
    }

    // Invalidation runs after the create already succeeded — a failure here
    // (e.g. a transient network blip on the refetch) must not be reported as
    // "creating the list failed".
    try {
      await router.invalidate()
    } catch {
      // Stale until the next interaction re-triggers a load.
    }
    onCreated(created.id)
  }

  return (
    <OverlayShell title="New list" onClose={onCancel}>
      <h2 className="mb-5 text-[1.3rem] font-extrabold">New list</h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField
          id="list-name"
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sunday morning rewatches"
        />
        <TextareaField
          id="list-description"
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What ties these films together?"
        />
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-lm-amber w-full cursor-pointer rounded-md py-3 text-[14px] font-bold text-[#1c1408] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating…' : 'Create list'}
        </button>
      </form>
    </OverlayShell>
  )
}
