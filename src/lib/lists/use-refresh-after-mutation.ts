import { useRouter } from '@tanstack/react-router'

// A List mutation's router.invalidate() failing must not be reported as
// the mutation itself failing — the write already succeeded, so a failure
// here (e.g. a transient network blip on the refetch) only leaves the
// on-screen data stale until the next successful load. Used by
// CreateListOverlay; ManageListOverlay's add/remove/delete mutations use
// the narrower useRefreshList/no-refresh instead, since a full
// router.invalidate() would also rerun getJournalEntries (issue #21,
// finding 7) — `onStale` lets the caller decide what, if anything, to show
// for that staleness.
export function useRefreshAfterMutation(onStale?: () => void) {
  const router = useRouter()

  return async () => {
    try {
      await router.invalidate()
    } catch {
      onStale?.()
    }
  }
}
