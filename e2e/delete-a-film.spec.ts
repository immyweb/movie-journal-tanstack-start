import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

import { logAFilm, registerNewUser } from './support'

// Critical CRUD journey named in ADR 0006 — register, log a film, delete it
// via the edit form's warning-and-confirm step (ADR 0010), and verify it's
// gone from the journal, with axe-core folded in for the WCAG AA requirement.
test('a signed-in user can delete a film after confirming a warning', async ({
  page,
}) => {
  const email = `delete-a-film-${Date.now()}@example.com`

  await test.step('register a new account', async () => {
    await registerNewUser(page, { name: 'Delete Tester', email })
  })

  await test.step('log a film to delete', async () => {
    await logAFilm(page, {
      title: 'The Matrix',
      buttonName: 'The Matrix, 1999',
    })
  })

  await test.step('open the entry and go to edit', async () => {
    const stub = page.getByRole('article').filter({ hasText: 'The Matrix' })
    await stub.click()
    await page.getByRole('link', { name: 'Edit' }).click()
  })

  await test.step('clicking delete opens a confirmation warning', async () => {
    await page.getByRole('button', { name: 'Delete this entry' }).click()
    await expect(
      page.getByRole('alertdialog', { name: 'Delete this entry?' }),
    ).toBeVisible()
    await expect(page.getByText('This can’t be undone.')).toBeVisible()
  })

  await test.step('the confirmation dialog has no accessibility violations', async () => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  await test.step('backing out of the warning keeps the entry', async () => {
    await page.getByRole('button', { name: 'Keep it' }).click()
    await expect(
      page.getByRole('alertdialog', { name: 'Delete this entry?' }),
    ).toBeHidden()
    await expect(
      page.getByRole('button', { name: 'Save changes' }),
    ).toBeVisible()
  })

  await test.step('confirming the warning deletes the entry', async () => {
    await page.getByRole('button', { name: 'Delete this entry' }).click()
    await page.getByRole('button', { name: 'Delete entry' }).click()
    await expect(page).toHaveURL('/journal')
    await expect(
      page.getByRole('article').filter({ hasText: 'The Matrix' }),
    ).toHaveCount(0)
  })
})
