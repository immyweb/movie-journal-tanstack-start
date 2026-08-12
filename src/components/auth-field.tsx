export function AuthField({
  id,
  label,
  error,
  ...props
}: React.ComponentProps<'input'> & { label: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="font-lm-mono text-lm-mist text-xs font-bold tracking-[0.08em] uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="border-lm-line bg-lm-ink text-lm-paper placeholder:text-lm-mist/60 focus-visible:border-lm-amber focus-visible:ring-lm-amber/30 aria-invalid:border-lm-red aria-invalid:ring-lm-red/25 h-10 w-full rounded-md border px-3 text-[15px] outline-none transition-colors focus-visible:ring-3 aria-invalid:ring-3"
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-lm-red text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
