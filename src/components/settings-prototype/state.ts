import { useState } from 'react'

// PROTOTYPE for issue #12 — see src/routes/_authed.settings-prototype.tsx.

// Mirrors ADR 0014's reserved-word denylist.
const RESERVED_USERNAMES = new Set([
  'journal',
  'register',
  'sign-in',
  'api',
  'lists',
  'login',
  'settings',
  'admin',
])

// Pretend these belong to other accounts already, so the prototype can show
// the uniqueness-conflict error distinctly from the reserved-word one.
const TAKEN_USERNAMES = new Set(['alice', 'bob'])

export function validateUsername(raw: string): string | null {
  const value = raw.trim().toLowerCase()
  if (value.length === 0) return 'Enter a username.'
  if (value.length < 3 || value.length > 20) {
    return 'Must be 3–20 characters.'
  }
  if (!/^[a-z0-9_]+$/.test(value)) {
    return 'Only lowercase letters, numbers, and underscores.'
  }
  if (RESERVED_USERNAMES.has(value)) return 'That username is reserved.'
  if (TAKEN_USERNAMES.has(value)) return 'That username is already taken.'
  return null
}

// In-memory only — mirrors ADR 0014's `username` + `journalIsPublic` shape,
// skipping `displayUsername` since casing display isn't part of the
// toggle/username-entry question this prototype answers.
export function useSettingsPrototypeState() {
  const [username, setUsername] = useState<string | null>(null)
  const [journalIsPublic, setJournalIsPublic] = useState(false)

  function claimUsername(raw: string): string | null {
    const error = validateUsername(raw)
    if (error) return error
    setUsername(raw.trim().toLowerCase())
    return null
  }

  // Claims a username and publishes in one action — the realization of ADR
  // 0014's invariant that setting journalIsPublic=true while username is
  // unset must happen as part of the same flow, not a separate prerequisite.
  function claimAndPublish(raw: string): string | null {
    const error = validateUsername(raw)
    if (error) return error
    setUsername(raw.trim().toLowerCase())
    setJournalIsPublic(true)
    return null
  }

  function setPublic(next: boolean) {
    if (next && !username) return
    setJournalIsPublic(next)
  }

  return {
    username,
    journalIsPublic,
    claimUsername,
    claimAndPublish,
    setPublic,
  }
}

export type SettingsPrototypeState = ReturnType<
  typeof useSettingsPrototypeState
>
