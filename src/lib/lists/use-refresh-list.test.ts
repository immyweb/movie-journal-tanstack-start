import { describe, expect, it, vi } from 'vitest'

import { getLists } from '#/lib/lists/lists'
import { useRefreshList } from '#/lib/lists/use-refresh-list'

vi.mock('#/lib/lists/lists', () => ({ getLists: vi.fn() }))

describe('useRefreshList', () => {
  it('returns the fresh list when it is still present', async () => {
    const list = { id: 'list_1', name: 'Best of the decade' }
    vi.mocked(getLists).mockResolvedValue([list] as never)

    const result = await useRefreshList('list_1')()

    expect(result).toEqual({ status: 'fresh', list })
  })

  it('returns "gone" when the refetch succeeds but the list is no longer in it', async () => {
    vi.mocked(getLists).mockResolvedValue([])

    const result = await useRefreshList('list_1')()

    expect(result).toEqual({ status: 'gone' })
  })

  it('returns "stale" when the refetch itself fails', async () => {
    vi.mocked(getLists).mockRejectedValue(new Error('network blip'))

    const result = await useRefreshList('list_1')()

    expect(result).toEqual({ status: 'stale' })
  })

  it('only re-fetches lists, never journal data', async () => {
    vi.mocked(getLists).mockResolvedValue([])

    await useRefreshList('list_1')()

    expect(getLists).toHaveBeenCalledTimes(1)
    expect(getLists).toHaveBeenCalledWith()
  })
})
