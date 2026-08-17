import { Outlet, createFileRoute } from '@tanstack/react-router'

import { SiteHeader } from '#/components/site-header'
import { SiteFooter } from '#/components/site-footer'

// Strictly anonymous shell for signed-out-visitor pages (List share links,
// public Journal views) — a sibling to `_authed`, not nested under it,
// since nesting would inherit its auth redirect (ADR 0015). No session
// lookup at all: output is identical for the owner and any other visitor.
// `noindex` is set once here; TanStack Router dedupes meta by name across
// nested routes, so every route under this layout inherits it for free.
export const Route = createFileRoute('/_public')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex' }],
  }),
  component: PublicLayout,
})

function PublicLayout() {
  return (
    <div className="bg-lm-ink font-lm-sans text-lm-paper min-h-screen antialiased">
      <SiteHeader homeTo="/" />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
