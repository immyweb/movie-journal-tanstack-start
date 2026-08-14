import { vi } from 'vitest'

import { getSession } from '#/lib/auth/functions'
import { renderRoute } from '#/test/render-route'
import { fakeSession } from '#/test/fixtures/session'

// getSession is mocked globally (src/test/mocks/auth.ts); every authed page
// test just needs it resolved to one signed-in user before its loader runs.
// The _authed guard's own redirect-when-signed-out test renders through
// renderRoute directly instead, so it can leave getSession unconfigured.
export async function renderAuthedRoute(path: string) {
  vi.mocked(getSession).mockResolvedValue(fakeSession)
  return renderRoute(path)
}
