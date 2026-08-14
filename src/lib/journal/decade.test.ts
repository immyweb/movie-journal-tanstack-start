import { describe, expect, it } from 'vitest'

import {
  decadeDateRange,
  formatDecade,
  getDecade,
  matchesDecadeFilter,
} from '#/lib/journal/decade'

describe('getDecade', () => {
  it('returns the decade start year for a release date', () => {
    expect(getDecade('1999-03-31')).toBe(1990)
    expect(getDecade('2000-01-01')).toBe(2000)
    expect(getDecade('2015-08-21')).toBe(2010)
  })

  it('returns null for a null release date', () => {
    expect(getDecade(null)).toBeNull()
  })
})

describe('formatDecade', () => {
  it('formats a decade start year as a label', () => {
    expect(formatDecade(1990)).toBe('1990s')
    expect(formatDecade(2000)).toBe('2000s')
  })
})

describe('decadeDateRange', () => {
  it('returns the [start, end) ISO date bounds for a decade', () => {
    expect(decadeDateRange(1990)).toEqual({
      start: '1990-01-01',
      end: '2000-01-01',
    })
  })

  it('includes the decade boundary years correctly', () => {
    const { start, end } = decadeDateRange(2010)
    expect('2010-01-01' >= start).toBe(true)
    expect('2019-12-31' < end).toBe(true)
    expect('2020-01-01' < end).toBe(false)
  })
})

describe('matchesDecadeFilter', () => {
  const nineties = decadeDateRange(1990)
  const twentyTens = decadeDateRange(2010)

  it('excludes a null release date whenever a decade filter is active', () => {
    expect(matchesDecadeFilter(null, [nineties])).toBe(false)
  })

  it('matches a release date within the selected range', () => {
    expect(matchesDecadeFilter('1996-12-07', [nineties])).toBe(true)
  })

  it('does not match a release date outside the selected range', () => {
    expect(matchesDecadeFilter('2015-08-21', [nineties])).toBe(false)
  })

  it('matches ANY of several selected ranges (OR within category)', () => {
    expect(matchesDecadeFilter('2015-08-21', [nineties, twentyTens])).toBe(true)
    expect(matchesDecadeFilter('1980-01-01', [nineties, twentyTens])).toBe(
      false,
    )
  })

  it('excludes a release date exactly on a range boundary end', () => {
    expect(matchesDecadeFilter('2000-01-01', [nineties])).toBe(false)
  })
})
