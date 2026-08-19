import { getLists, type ListWithItems } from '#/lib/lists/lists'

// 'fresh' is the managed List, re-read straight from the DB. 'gone' means
// the refetch succeeded but this List is no longer in it — e.g. deleted
// from another tab mid-mutation — which the caller should treat the same
// as its own delete. 'stale' means the refetch itself failed, so the
// on-screen List may not reflect the mutation that just succeeded.
export type RefreshListResult =
  | { status: 'fresh'; list: ListWithItems }
  | { status: 'gone' }
  | { status: 'stale' }

// Re-fetches just this user's Lists (getLists() alone) after an
// add/remove-item mutation in ManageListOverlay, and picks out the one List
// being managed. Deliberately not router.invalidate() — that reruns the
// whole /lists loader, including getJournalEntries, even though list-item
// mutations never touch journal data (issue #21, finding 7).
export function useRefreshList(listId: string) {
  return async (): Promise<RefreshListResult> => {
    try {
      const lists = await getLists()
      const fresh = lists.find((list) => list.id === listId)
      return fresh ? { status: 'fresh', list: fresh } : { status: 'gone' }
    } catch {
      return { status: 'stale' }
    }
  }
}
