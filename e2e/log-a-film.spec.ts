import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

import { gotoAndHydrate, registerNewUser } from './support'

// Critical CRUD journey named in ADR 0006 — register, log a film (with a
// rewatch), verify it lands in the journal, with axe-core folded in for the
// WCAG AA requirement.
test('a signed-in user can log a film, including a rewatch', async ({
  page,
}) => {
  const email = `log-a-film-${Date.now()}@example.com`

  await test.step('register a new account', async () => {
    await registerNewUser(page, { name: 'Stub Tester', email })
  })

  await test.step('search TMDB and select a film', async () => {
    await gotoAndHydrate(page, '/journal/new')
    await page.getByLabel('Search TMDB').fill('The Matrix')
    await page
      .getByRole('button', { name: 'The Matrix, 1999', exact: true })
      .click()
  })

  await test.step('page has no accessibility violations', async () => {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  await test.step('fill in and submit the logging form', async () => {
    await page.locator('#dateWatched').fill('2026-08-01')
    await page.getByRole('radio', { name: '5 stars' }).click()
    await page
      .getByLabel('Review')
      .fill('Still thinking about the bullet time.')
    await page.getByRole('switch').click()
    await page.getByRole('button', { name: 'Log this watch' }).click()
    await expect(page).toHaveURL('/journal')
  })

  await test.step('the entry appears in the journal', async () => {
    const stub = page.getByRole('article').filter({ hasText: 'The Matrix' })
    await expect(stub).toContainText('01 AUG 2026')
    await expect(stub.getByLabel('Liked')).toBeVisible()
    await expect(stub).toContainText('Still thinking about the bullet time.')
  })

  await test.step('logging the same film again surfaces the watch count', async () => {
    await gotoAndHydrate(page, '/journal/new')
    await page.getByLabel('Search TMDB').fill('The Matrix')
    await page
      .getByRole('button', { name: 'The Matrix, 1999', exact: true })
      .click()
    await expect(page.getByTestId('watch-count-notice')).toContainText(
      /logged this .*before/i,
    )
  })
})
