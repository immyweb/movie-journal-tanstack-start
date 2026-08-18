import { describe, expect, it } from 'vitest'

import { parseSaveUsernameInput } from '#/lib/settings/save-username'

describe('parseSaveUsernameInput', () => {
  it('returns the parsed data for a valid username', () => {
    expect(parseSaveUsernameInput({ username: 'riley' })).toEqual({
      username: 'riley',
    })
  })

  it('throws the schema message for a too-short username', () => {
    expect(() => parseSaveUsernameInput({ username: 'ab' })).toThrow(
      'Must be 3–20 characters.',
    )
  })

  it('throws the schema message for disallowed characters', () => {
    expect(() => parseSaveUsernameInput({ username: 'Riley!' })).toThrow(
      'Only lowercase letters, numbers, and underscores.',
    )
  })

  it('throws the schema message for a reserved username', () => {
    expect(() => parseSaveUsernameInput({ username: 'settings' })).toThrow(
      'That username is reserved.',
    )
  })
})
