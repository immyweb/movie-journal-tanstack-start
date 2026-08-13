import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

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
        <SiteHeader homeTo="/journal" action={<SignOutButton />} />
        <MarqueeBulbs />
      </div>
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
