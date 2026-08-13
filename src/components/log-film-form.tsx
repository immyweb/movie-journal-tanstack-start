import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Film } from 'lucide-react'

import { cn } from '#/lib/utils'
import { formatReleaseYear } from '#/lib/format-release-year'
import {
  logFilmFormSchema,
  type LogFilmFormInput,
} from '#/lib/validation/journal-entry'
import { AuthField } from '#/components/auth-field'
import { TextareaField } from '#/components/textarea-field'
import { RatingInput } from '#/components/rating-input'
import { TicketSubmitButton } from '#/components/ticket-button'
import { ErrorBanner } from '#/components/error-banner'

type FilmSummary = {
  tmdbId: string
  title: string
  releaseDate: string | null
  posterUrl: string | null
}

export type LogFilmFormProps = {
  movie: FilmSummary
  defaultValues: LogFilmFormInput
  watchCountNotice?: React.ReactNode
  onCancel?: () => void
  cancelLabel?: string
  submitLabel: string
  submittingLabel: string
  onSubmit: (values: LogFilmFormInput) => Promise<void>
}

// Presentational: fetching watch counts and deciding what a submit error
// means (e.g. logFilm's TMDB-outage message) are call-site concerns, so this
// form only renders fields and reports whatever error message it's given.
// The watch-count notice follows the same rule — the create flow's "this
// will add a rewatch" warning and the edit flow's lack of any notice at all
// are both call-site decisions, not this component's to make.
export function LogFilmForm({
  movie,
  defaultValues,
  watchCountNotice,
  onCancel,
  cancelLabel = 'Change film',
  submitLabel,
  submittingLabel,
  onSubmit,
}: LogFilmFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LogFilmFormInput>({
    resolver: zodResolver(logFilmFormSchema),
    defaultValues,
  })

  const submit = async (values: LogFilmFormInput) => {
    setFormError(null)

    try {
      await onSubmit(values)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <div className="border-lm-line bg-lm-surface rounded-xl border p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="bg-lm-ink w-16 shrink-0 overflow-hidden rounded-md">
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt=""
              className="block aspect-[2/3] w-full object-cover"
            />
          ) : (
            <div className="text-lm-mist flex aspect-[2/3] w-full items-center justify-center">
              <Film aria-hidden="true" size={20} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] leading-[1.25] font-extrabold">
            {movie.title}
          </div>
          <div className="text-lm-mist text-[13px]">
            {formatReleaseYear(movie.releaseDate)}
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-lm-amber font-lm-mono mt-2 cursor-pointer text-xs tracking-[0.08em] uppercase underline underline-offset-4"
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </div>

      {watchCountNotice && (
        <p
          data-testid="watch-count-notice"
          className="border-lm-line bg-lm-ink text-lm-mist mb-6 rounded-md border px-3 py-2 text-sm"
        >
          {watchCountNotice}
        </p>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>
        <AuthField
          id="dateWatched"
          label="Date watched"
          type="date"
          error={errors.dateWatched?.message}
          {...register('dateWatched')}
        />

        <div className="space-y-1.5">
          <span className="font-lm-mono text-lm-mist text-xs font-bold tracking-[0.08em] uppercase">
            Rating
          </span>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <RatingInput value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <TextareaField
          id="review"
          label="Review"
          placeholder="What did you think?"
          error={errors.review?.message}
          {...register('review')}
        />

        <div className="space-y-1.5">
          <span className="font-lm-mono text-lm-mist text-xs font-bold tracking-[0.08em] uppercase">
            Liked it?
          </span>
          <Controller
            control={control}
            name="like"
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  'cursor-pointer rounded-full px-[14px] py-2 text-xs font-bold tracking-[0.05em]',
                  field.value
                    ? 'bg-lm-red/16 text-[#e77b90]'
                    : // lm-mist text fails AA (4.27:1) against this pill's
                      // composited background — nudged lighter to clear 4.5:1.
                      'bg-lm-mist/14 text-[#9698aa]',
                )}
              >
                {field.value ? 'Liked' : 'Not liked'}
              </button>
            )}
          />
        </div>

        {formError && <ErrorBanner>{formError}</ErrorBanner>}

        <TicketSubmitButton className="w-full" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </TicketSubmitButton>
      </form>
    </div>
  )
}
