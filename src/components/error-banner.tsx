export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="border-lm-red/40 bg-lm-red/10 text-lm-red rounded-md border px-3 py-2 text-sm"
    >
      {children}
    </p>
  )
}
