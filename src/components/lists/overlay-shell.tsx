import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'

// The full-screen modal frame shared by the create-list and manage-list
// overlays (issue #16's card-hub + overlay UI). Built on radix-ui's Dialog,
// same primitive family as the delete-confirm AlertDialog elsewhere in the
// app (_authed.journal_.$entryId_.edit.tsx) — gets focus trapping, Escape-
// to-close, and return-focus-on-close for free rather than reimplementing
// them. `title` labels the dialog for assistive tech; each overlay's own
// visible heading (name, description, ...) stays in `children`.
export function OverlayShell({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="bg-lm-ink border-lm-line fixed top-1/2 left-1/2 z-40 max-h-[85vh] w-[calc(100%-3rem)] max-w-[720px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border p-6">
          <Dialog.Title asChild>
            <span className="sr-only">{title}</span>
          </Dialog.Title>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close"
              className="text-lm-mist hover:text-lm-paper focus-visible:outline-lm-amber absolute top-4 right-4 cursor-pointer outline-none focus-visible:outline-2"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
