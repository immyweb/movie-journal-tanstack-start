import { Link } from '@tanstack/react-router'

import { Tear } from '#/components/tear-divider'

export function AuthCard({
  eyebrow,
  title,
  description,
  tabLabel,
  footer,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  tabLabel: string
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-lm-ink font-lm-sans text-lm-paper flex min-h-screen flex-col antialiased">
      <header className="mx-auto flex w-full max-w-[1120px] justify-center px-6 py-[26px] max-sm:px-5">
        <Link
          to="/"
          className="text-[15px] font-extrabold tracking-[0.06em] uppercase max-sm:text-[13px]"
        >
          Movie <span className="text-lm-amber">Journal</span>
        </Link>
      </header>

      <Tear />

      <main className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-[420px]">
          <div className="mb-7 text-center">
            <div className="text-lm-amber font-lm-mono text-xs font-bold tracking-[0.14em] uppercase">
              {eyebrow}
            </div>
            <h1 className="mt-2.5 text-[clamp(1.7rem,4vw,2.2rem)] font-extrabold">
              {title}
            </h1>
            <p className="text-lm-mist mt-2 text-[15px] leading-[1.5]">
              {description}
            </p>
          </div>

          <div className="border-lm-line bg-lm-surface relative flex items-stretch overflow-hidden rounded-xl border">
            <div className="min-w-0 flex-1 p-6">{children}</div>

            <div
              aria-hidden="true"
              className="border-lm-line before:bg-lm-ink after:bg-lm-ink relative my-4 w-0 shrink-0 border-l-2 border-dashed before:absolute before:-left-2 before:top-[-8px] before:size-4 before:rounded-full before:content-[''] after:absolute after:-left-2 after:bottom-[-8px] after:size-4 after:rounded-full after:content-['']"
            />

            <div
              aria-hidden="true"
              className="flex w-11 shrink-0 flex-col items-center justify-center gap-3 py-4"
            >
              <span className="bg-lm-amber motion-safe:animate-lm-flicker size-1.5 rounded-full shadow-[0_0_6px_2px_rgba(242,169,59,0.55)]" />
              <span className="font-lm-mono text-lm-mist rotate-180 text-[10px] font-bold tracking-[0.2em] [writing-mode:vertical-rl]">
                {tabLabel}
              </span>
            </div>
          </div>

          <p className="text-lm-mist mt-6 text-center text-sm">{footer}</p>
        </div>
      </main>
    </div>
  )
}
