import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderAuthedRoute } from '#/test/render-authed-route'
import { getSettings } from '#/lib/settings/get-settings'
import { saveUsername } from '#/lib/settings/save-username'
import { setJournalPublic } from '#/lib/settings/set-journal-public'

vi.mock('#/lib/settings/get-settings', () => ({ getSettings: vi.fn() }))
vi.mock('#/lib/settings/save-username', () => ({ saveUsername: vi.fn() }))
vi.mock('#/lib/settings/set-journal-public', () => ({
  setJournalPublic: vi.fn(),
}))

function mockLoaderData({
  username = null,
  journalIsPublic = false,
}: { username?: string | null; journalIsPublic?: boolean } = {}) {
  vi.mocked(getSettings).mockResolvedValue({ username, journalIsPublic })
}

describe('Settings', () => {
  it('rejects a username that is too short', async () => {
    mockLoaderData()
    const user = userEvent.setup()
    await renderAuthedRoute('/settings')

    await user.type(screen.getByLabelText('Username'), 'ab')
    await user.click(screen.getByRole('button', { name: 'Save username' }))

    expect(
      await screen.findByText('Must be 3–20 characters.'),
    ).toBeInTheDocument()
    expect(saveUsername).not.toHaveBeenCalled()
  })

  it('rejects a username with disallowed characters', async () => {
    mockLoaderData()
    const user = userEvent.setup()
    await renderAuthedRoute('/settings')

    await user.type(screen.getByLabelText('Username'), 'Riley!')
    await user.click(screen.getByRole('button', { name: 'Save username' }))

    expect(
      await screen.findByText(
        'Only lowercase letters, numbers, and underscores.',
      ),
    ).toBeInTheDocument()
    expect(saveUsername).not.toHaveBeenCalled()
  })

  it('rejects a reserved username', async () => {
    mockLoaderData()
    const user = userEvent.setup()
    await renderAuthedRoute('/settings')

    await user.type(screen.getByLabelText('Username'), 'settings')
    await user.click(screen.getByRole('button', { name: 'Save username' }))

    expect(
      await screen.findByText('That username is reserved.'),
    ).toBeInTheDocument()
    expect(saveUsername).not.toHaveBeenCalled()
  })

  it('shows an error when the username is already taken', async () => {
    mockLoaderData()
    vi.mocked(saveUsername).mockRejectedValue(
      new Error('That username is already taken.'),
    )
    const user = userEvent.setup()
    await renderAuthedRoute('/settings')

    await user.type(screen.getByLabelText('Username'), 'riley')
    await user.click(screen.getByRole('button', { name: 'Save username' }))

    expect(
      await screen.findByText('That username is already taken.'),
    ).toBeInTheDocument()
  })

  it('saves a valid username and enables the publish toggle', async () => {
    mockLoaderData()
    vi.mocked(saveUsername).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    await renderAuthedRoute('/settings')

    expect(
      screen.getByRole('switch', { name: 'Publish Journal' }),
    ).toBeDisabled()

    await user.type(screen.getByLabelText('Username'), 'riley')
    await user.click(screen.getByRole('button', { name: 'Save username' }))

    await waitFor(() =>
      expect(saveUsername).toHaveBeenCalledWith({
        data: { username: 'riley' },
      }),
    )
    await waitFor(() =>
      expect(
        screen.getByRole('switch', { name: 'Publish Journal' }),
      ).toBeEnabled(),
    )
  })

  it('toggles the journal public on and off', async () => {
    mockLoaderData({ username: 'riley', journalIsPublic: false })
    vi.mocked(setJournalPublic).mockResolvedValue(undefined as never)
    const user = userEvent.setup()
    await renderAuthedRoute('/settings')

    const toggle = screen.getByRole('switch', { name: 'Publish Journal' })
    expect(toggle).toBeEnabled()
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await user.click(toggle)

    await waitFor(() =>
      expect(setJournalPublic).toHaveBeenCalledWith({
        data: { journalIsPublic: true },
      }),
    )
    expect(await screen.findByText('/journal/riley')).toBeInTheDocument()

    await user.click(toggle)

    await waitFor(() =>
      expect(setJournalPublic).toHaveBeenCalledWith({
        data: { journalIsPublic: false },
      }),
    )
    await waitFor(() =>
      expect(screen.queryByText('/journal/riley')).not.toBeInTheDocument(),
    )
  })

  it('shows an error when the server rejects publishing without a username', async () => {
    mockLoaderData({ username: 'riley', journalIsPublic: false })
    vi.mocked(setJournalPublic).mockRejectedValue(
      new Error('Set a username before publishing your journal.'),
    )
    const user = userEvent.setup()
    await renderAuthedRoute('/settings')

    await user.click(screen.getByRole('switch', { name: 'Publish Journal' }))

    expect(
      await screen.findByText('Set a username before publishing your journal.'),
    ).toBeInTheDocument()
  })
})
