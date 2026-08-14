import { describe, expect, it } from 'vitest'

import { renderRoute } from '#/test/render-route'

describe('_authed layout guard', () => {
  it('redirects unauthenticated visitors to sign in', async () => {
    const { router } = await renderRoute('/journal')

    expect(router.state.location.pathname).toBe('/sign-in')
  })
})
