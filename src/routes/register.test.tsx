import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderRoute } from '#/test/render-route'
import { authClient } from '#/lib/auth/client'

vi.mock('#/lib/auth/client', () => ({
  authClient: { signUp: { email: vi.fn() } },
}))

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Name'), 'Riley Chen')
  await user.type(screen.getByLabelText('Email'), 'riley@example.com')
  await user.type(screen.getByLabelText('Password'), 'correct-horse-battery')
}

describe('Register', () => {
  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup()
    await renderRoute('/register')

    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
    expect(
      screen.getByText('Password must be at least 8 characters'),
    ).toBeInTheDocument()
    expect(authClient.signUp.email).not.toHaveBeenCalled()
  })

  it('shows an inline error when the email is already registered', async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      error: {
        code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL',
        message: 'User already exists',
      },
    } as never)

    const user = userEvent.setup()
    await renderRoute('/register')
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(
      await screen.findByText('An account with this email already exists.'),
    ).toBeInTheDocument()
  })

  it('shows a generic error banner for other signup failures', async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      error: { code: 'INTERNAL_ERROR', message: 'Something broke upstream' },
    } as never)

    const user = userEvent.setup()
    await renderRoute('/register')
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something broke upstream',
    )
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolveSignUp: (value: unknown) => void = () => {}
    vi.mocked(authClient.signUp.email).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignUp = resolve
        }) as never,
    )

    const user = userEvent.setup()
    await renderRoute('/register')
    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(
      await screen.findByRole('button', { name: 'Creating account…' }),
    ).toBeDisabled()

    resolveSignUp({ error: null })
  })

  it('navigates to the journal on successful registration', async () => {
    vi.mocked(authClient.signUp.email).mockResolvedValue({
      error: null,
    } as never)

    const user = userEvent.setup()
    const { router } = await renderRoute('/register')
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(undefined as never)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() =>
      expect(navigateSpy).toHaveBeenCalledWith({ to: '/journal' }),
    )
    expect(authClient.signUp.email).toHaveBeenCalledWith({
      name: 'Riley Chen',
      email: 'riley@example.com',
      password: 'correct-horse-battery',
    })
  })
})
