import { render } from '@testing-library/react'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { getRouter } from '#/router'

// Renders through the real app router (ADR-0011), matching TanStack Start's
// own documented test pattern, rather than a stand-in router per test.
export async function renderRoute(path: string) {
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = getRouter()

  const view = render(<RouterProvider router={router} history={history} />)
  await router.load()

  return { ...view, router }
}
