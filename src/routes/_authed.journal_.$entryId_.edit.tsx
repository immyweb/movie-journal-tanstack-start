import { useState } from 'react'
import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from '@tanstack/react-router'
import { AlertDialog } from 'radix-ui'

import { toISODateUTC } from '#/lib/format-date-watched'
import { type LogFilmFormInput } from '#/lib/validation/journal-entry'
import { editFilm, getJournalEntryForEdit } from '#/lib/journal/edit-film'
import { deleteFilm } from '#/lib/journal/delete-film'
import { LogFilmForm } from '#/components/log-film-form'
import { ErrorBanner } from '#/components/error-banner'
import { EntryNotFound } from '#/components/entry-not-found'

export const Route = createFileRoute('/_authed/journal_/$entryId_/edit')({
  loader: async ({ params }) => {
    const entry = await getJournalEntryForEdit({
      data: { entryId: params.entryId },
    })

    if (!entry) throw notFound()

    return entry
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `Edit ${loaderData.movie.title} — Movie Journal` }]
      : undefined,
  }),
  notFoundComponent: EntryNotFound,
  component: EditEntryPage,
})

function EditEntryPage() {
  const router = useRouter()
  const entry = Route.useLoaderData()
  const movie = entry.movie

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteFilm({ data: { entryId: entry.id } })
      router.navigate({ to: '/journal' })
    } catch {
      setDeleteError(
        'Something went wrong deleting this entry. Please try again.',
      )
      setIsDeleting(false)
    }
  }

  const onSubmit = async (values: LogFilmFormInput) => {
    try {
      await editFilm({
        data: {
          entryId: entry.id,
          dateWatched: values.dateWatched,
          rating: values.rating,
          review: values.review?.trim() ? values.review.trim() : null,
          like: values.like,
        },
      })
      router.navigate({
        to: '/journal/$entryId',
        params: { entryId: entry.id },
      })
    } catch {
      throw new Error(
        'Something went wrong saving these changes. Please try again.',
      )
    }
  }

  return (
    <>
      <section className="px-6 pt-6 pb-10 text-center">
        <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
          Edit
        </div>
        <h1 className="mt-2.5 text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-black tracking-[-0.01em] text-balance">
          Edit this watch
        </h1>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-[720px] space-y-5">
          <LogFilmForm
            movie={{
              tmdbId: movie.tmdbId,
              title: movie.title,
              releaseDate: movie.releaseDate,
              posterUrl: movie.posterImg,
            }}
            defaultValues={{
              dateWatched: toISODateUTC(entry.dateWatched),
              rating: entry.rating,
              review: entry.review,
              like: entry.like,
            }}
            submitLabel="Save changes"
            submittingLabel="Saving…"
            onSubmit={onSubmit}
          />

          <div className="flex items-center justify-center gap-6">
            <Link
              to="/journal/$entryId"
              params={{ entryId: entry.id }}
              className="text-lm-amber font-lm-mono cursor-pointer text-xs tracking-[0.08em] uppercase underline underline-offset-4"
            >
              Cancel
            </Link>

            <AlertDialog.Root
              open={isDeleteOpen}
              onOpenChange={setIsDeleteOpen}
            >
              <AlertDialog.Trigger asChild>
                <button
                  type="button"
                  className="font-lm-mono cursor-pointer text-xs tracking-[0.08em] text-[#e77b90] uppercase underline underline-offset-4"
                >
                  Delete this entry
                </button>
              </AlertDialog.Trigger>
              <AlertDialog.Portal>
                <AlertDialog.Overlay className="fixed inset-0 z-50 bg-lm-ink/80" />
                <AlertDialog.Content className="border-lm-line bg-lm-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6">
                  <AlertDialog.Title className="text-lm-paper text-lg font-extrabold">
                    Delete this entry?
                  </AlertDialog.Title>
                  <AlertDialog.Description className="text-lm-mist mt-2 text-sm leading-[1.5]">
                    This removes your rating, review, and watch date for{' '}
                    {movie.title}. This can&rsquo;t be undone.
                  </AlertDialog.Description>

                  {deleteError && (
                    <div className="mt-4">
                      <ErrorBanner>{deleteError}</ErrorBanner>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <AlertDialog.Cancel asChild>
                      <button
                        type="button"
                        className="text-lm-mist font-lm-mono cursor-pointer text-xs tracking-[0.08em] uppercase"
                      >
                        Keep it
                      </button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action asChild>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={(event) => {
                          event.preventDefault()
                          void handleDelete()
                        }}
                        className="bg-lm-red cursor-pointer rounded-md px-4 py-2 text-xs font-bold tracking-[0.05em] text-white uppercase disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? 'Deleting…' : 'Delete entry'}
                      </button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </div>
        </div>
      </section>
    </>
  )
}
