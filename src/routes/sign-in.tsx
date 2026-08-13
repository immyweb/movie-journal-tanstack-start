import { useState } from 'react'
import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { authClient } from '#/lib/auth/client'
import { signInSchema, type SignInInput } from '#/lib/validation/auth'
import { AuthCard } from '#/components/auth-card'
import { AuthField } from '#/components/auth-field'
import { ErrorBanner } from '#/components/error-banner'
import { TicketSubmitButton } from '#/components/ticket-button'

export const Route = createFileRoute('/sign-in')({
  head: () => ({
    meta: [{ title: 'Sign in — Movie Journal' }],
  }),
  component: SignInPage,
})

function SignInPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (values: SignInInput) => {
    setFormError(null)
    const { error } = await authClient.signIn.email(values)

    if (error) {
      // Deliberately generic: don't reveal whether the email is registered.
      setFormError(error.message ?? 'Invalid email or password.')
      return
    }

    await router.navigate({ to: '/journal' })
  }

  return (
    <AuthCard
      eyebrow="Ticket holders"
      title="Sign in"
      description="Welcome back to your journal."
      tabLabel="SIGN IN"
      footer={
        <>
          Need an account?{' '}
          <Link
            to="/register"
            className="text-lm-amber font-medium underline underline-offset-4"
          >
            Register
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {formError && <ErrorBanner>{formError}</ErrorBanner>}

        <TicketSubmitButton className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </TicketSubmitButton>
      </form>
    </AuthCard>
  )
}
