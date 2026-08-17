import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { getSession } from '#/lib/auth/functions'
import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'
import { SignOutButton } from '#/components/sign-out-button'
import { MarqueeBulbs } from '#/components/marquee-bulbs'

// Shared shell for every signed-in page. Guards the session once here so
// nested routes (journal, journal/new, ...) don't each re-check it — they
// read the resulting `user` back via `Route.useRouteContext()`.
export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSession()

    if (!session) {
      throw redirect({ to: '/sign-in' })
    }

    return { user: session.user }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <div className="bg-lm-ink font-lm-sans text-lm-paper min-h-screen antialiased">
      <div className="relative z-20">
        <SiteHeader
          homeTo="/journal"
          action={
            <div className="flex items-center gap-4">
              <Link
                to="/lists"
                className="text-lm-paper hover:text-lm-amber focus-visible:outline-lm-amber text-sm font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Your lists
              </Link>
              <SignOutButton />
            </div>
          }
        />
        <MarqueeBulbs />
      </div>
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
