import { Link } from '@tanstack/react-router'

import { cn } from '#/lib/utils'

// Shared with the homepage CTA — the notch-punched pill is Movie Journal's
// signature control, not just a homepage flourish.
export const ticketButtonClass =
  "bg-lm-amber before:bg-lm-ink after:bg-lm-ink relative inline-flex shrink-0 items-center justify-center gap-2.5 rounded-md px-[34px] py-4 text-[15px] font-bold tracking-[0.02em] text-[#1c1408] no-underline shadow-[0_8px_24px_-8px_rgba(242,169,59,0.5)] outline-none transition-[transform,box-shadow] duration-150 before:absolute before:top-1/2 before:-left-2 before:size-4 before:-translate-y-1/2 before:rounded-full before:content-[''] after:absolute after:top-1/2 after:-right-2 after:size-4 after:-translate-y-1/2 after:rounded-full after:content-[''] hover:-translate-y-px hover:shadow-[0_12px_28px_-8px_rgba(242,169,59,0.6)] active:translate-y-0 focus-visible:outline-lm-ink focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50"

export function TicketLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return <Link className={cn(ticketButtonClass, className)} {...props} />
}

export function TicketSubmitButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type="submit"
      className={cn(ticketButtonClass, className)}
      {...props}
    />
  )
}
