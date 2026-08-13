import { expect, type Page } from '@playwright/test'

// Authenticated routes SSR the shell once then hydrate (ADR 0004) — a plain
// `goto` leaves a window where the DOM is present but not yet interactive,
// so a fast Playwright click can hit native form submission before React
// attaches its handlers. Wait for hydration to settle first.
export async function gotoAndHydrate(page: Page, url: string) {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

export async function registerNewUser(
  page: Page,
  { name, email }: { name: string; email: string },
) {
  await gotoAndHydrate(page, '/register')
  await page.getByLabel('Name').fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('correct-horse-battery')
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page).toHaveURL('/journal')
}

export async function logAFilm(
  page: Page,
  {
    title,
    buttonName,
    dateWatched = '2026-08-01',
    rating,
    review,
    like,
  }: {
    title: string
    buttonName: string
    dateWatched?: string
    rating?: number
    review?: string
    like?: boolean
  },
) {
  await gotoAndHydrate(page, '/journal/new')
  await page.getByLabel('Search TMDB').fill(title)
  await page.getByRole('button', { name: buttonName, exact: true }).click()
  await page.locator('#dateWatched').fill(dateWatched)
  if (rating != null) {
    await page
      .getByRole('radio', { name: `${rating} star${rating === 1 ? '' : 's'}` })
      .click()
  }
  if (review != null) {
    await page.getByLabel('Review').fill(review)
  }
  if (like) {
    await page.getByRole('switch').click()
  }
  await page.getByRole('button', { name: 'Log this watch' }).click()
  await expect(page).toHaveURL('/journal')
}
