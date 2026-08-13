import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { authClient } from '#/lib/auth/client'
import { registerSchema, type RegisterInput } from '#/lib/validation/auth'
import { AuthCard } from '#/components/auth-card'
import { AuthField } from '#/components/auth-field'
import { ErrorBanner } from '#/components/error-banner'
import { TicketSubmitButton } from '#/components/ticket-button'

export const Route = createFileRoute('/register')({
  head: () => ({
    meta: [{ title: 'Register — Movie Journal' }],
  }),
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null)
    const { error } = await authClient.signUp.email(values)

    if (error) {
      if (error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        setError('email', {
          message: 'An account with this email already exists.',
        })
        return
      }
      setFormError(error.message ?? 'Something went wrong. Please try again.')
      return
    }

    await router.navigate({ to: '/journal' })
  }

  return (
    <AuthCard
      eyebrow="Admit one"
      title="Register"
      description="Create an account to start your journal."
      tabLabel="REGISTER"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/sign-in"
            className="text-lm-amber font-medium underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthField
          id="name"
          label="Name"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {formError && <ErrorBanner>{formError}</ErrorBanner>}

        <TicketSubmitButton className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Register'}
        </TicketSubmitButton>
      </form>
    </AuthCard>
  )
}
