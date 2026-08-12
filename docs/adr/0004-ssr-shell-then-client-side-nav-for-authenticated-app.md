# Authenticated routes: SSR the shell once, then client-side navigation

SYSTEM-DESIGN.md calls for an "app-like SPA experience" on authenticated pages, as opposed to full SSR on public pages. Rather than disabling SSR entirely on authenticated routes, the initial authenticated shell is server-rendered once and TanStack Router then handles subsequent navigations client-side (its default behavior). This delivers the requested app-like feel without added configuration, and mirrors what Next.js's App Router gives for free — keeping the comparison fair.
