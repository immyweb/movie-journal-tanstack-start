import {
  createFileRoute,
  Link,
  notFound,
  useRouter,
} from '@tanstack/react-router'

import { toISODateUTC } from '#/lib/format-date-watched'
import { type LogFilmFormInput } from '#/lib/validation/journal-entry'
import { editFilm, getJournalEntryForEdit } from '#/lib/journal/edit-film'
import { LogFilmForm } from '#/components/log-film-form'

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
  component: EditEntryPage,
})

function EditEntryPage() {
  const router = useRouter()
  const entry = Route.useLoaderData()
  const movie = entry.movie

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

          <div className="text-center">
            <Link
              to="/journal/$entryId"
              params={{ entryId: entry.id }}
              className="text-lm-amber font-lm-mono cursor-pointer text-xs tracking-[0.08em] uppercase underline underline-offset-4"
            >
              Cancel
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
