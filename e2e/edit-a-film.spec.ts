import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

import { logAFilm, registerNewUser } from './support'

// Critical CRUD journey named in ADR 0006 — register, log a film, edit every
// field on the edit form to a different value, and verify the change lands
// on the film detail page, with axe-core folded in for the WCAG AA
// requirement.
test('a signed-in user can edit a film', async ({ page }) => {
  const email = `edit-a-film-${Date.now()}@example.com`

  await test.step('register a new account', async () => {
    await registerNewUser(page, { name: 'Edit Tester', email })
  })

  await test.step('log a film to edit', async () => {
    await logAFilm(page, {
      title: 'The Matrix',
      buttonName: 'The Matrix, 1999',
      dateWatched: '2026-07-15',
      rating: 3,
      review: 'Solid but not my favorite Wachowski film.',
      like: false,
    })
  })

  await test.step('open the entry and go to edit', async () => {
    const stub = page.getByRole('article').filter({ hasText: 'The Matrix' })
    await stub.click()
    await page.getByRole('link', { name: 'Edit' }).click()
  })

  await test.step('the edit form has no accessibility violations', async () => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  await test.step('change every field and save', async () => {
    await page.locator('#dateWatched').fill('2026-08-01')
    await page.getByRole('radio', { name: '5 stars' }).click()
    await page
      .getByLabel('Review')
      .fill('Actually this holds up even better on a rewatch.')
    await page.getByRole('switch').click()
    await page.getByRole('button', { name: 'Save changes' }).click()
  })

  await test.step('the film detail page reflects the changes', async () => {
    await expect(page).toHaveURL(/\/journal\/[^/]+$/)
    await expect(page.getByLabel('5 out of 5 stars')).toBeVisible()
    await expect(page.getByLabel('Liked')).toBeVisible()
    await expect(page.getByText('WATCHED 01 AUG 2026')).toBeVisible()
    await expect(
      page.getByText('Actually this holds up even better on a rewatch.'),
    ).toBeVisible()
  })
})
