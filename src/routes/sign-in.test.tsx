import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderRoute } from '#/test/render-route'
import { authClient } from '#/lib/auth/client'

vi.mock('#/lib/auth/client', () => ({
  authClient: { signIn: { email: vi.fn() } },
}))

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'riley@example.com')
  await user.type(screen.getByLabelText('Password'), 'correct-horse-battery')
}

describe('Sign in', () => {
  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup()
    await renderRoute('/sign-in')

    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Enter a valid email address'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Password must be at least 8 characters'),
    ).toBeInTheDocument()
    expect(authClient.signIn.email).not.toHaveBeenCalled()
  })

  it('shows a generic error banner for invalid credentials, without revealing why', async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      error: { code: 'INVALID_CREDENTIALS', message: null },
    } as never)

    const user = userEvent.setup()
    await renderRoute('/sign-in')
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password.',
    )
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolveSignIn: (value: unknown) => void = () => {}
    vi.mocked(authClient.signIn.email).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve
        }) as never,
    )

    const user = userEvent.setup()
    await renderRoute('/sign-in')
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('button', { name: 'Signing in…' }),
    ).toBeDisabled()

    resolveSignIn({ error: null })
  })

  it('navigates to the journal on successful sign-in', async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValue({
      error: null,
    } as never)

    const user = userEvent.setup()
    const { router } = await renderRoute('/sign-in')
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(undefined as never)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() =>
      expect(navigateSpy).toHaveBeenCalledWith({ to: '/journal' }),
    )
  })
})
