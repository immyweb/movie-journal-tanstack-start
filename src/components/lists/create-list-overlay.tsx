import { useState } from 'react'

import { createList } from '#/lib/lists/create-list'
import type { ListWithItems } from '#/lib/lists/lists'
import { useRefreshAfterMutation } from '#/lib/lists/use-refresh-after-mutation'
import {
  LIST_DESCRIPTION_MAX_LENGTH,
  LIST_NAME_MAX_LENGTH,
} from '#/lib/validation/list'
import { AuthField } from '#/components/auth-field'
import { TextareaField } from '#/components/textarea-field'
import { ErrorBanner } from '#/components/error-banner'
import { OverlayShell } from '#/components/lists/overlay-shell'

export function CreateListOverlay({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (created: ListWithItems) => void
}) {
  const refreshAfterMutation = useRefreshAfterMutation()
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

    // onCreated gets the created list directly rather than just its id, so
    // the manage overlay can still open even if the refresh below fails and
    // `lists` stays stale (issue #20, finding 1).
    await refreshAfterMutation()
    onCreated({ ...created, listItems: [] })
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
          maxLength={LIST_NAME_MAX_LENGTH}
        />
        <TextareaField
          id="list-description"
          label="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What ties these films together?"
          maxLength={LIST_DESCRIPTION_MAX_LENGTH}
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
