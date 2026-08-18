import { describe, expect, it } from 'vitest'

import {
  LIST_DESCRIPTION_MAX_LENGTH,
  LIST_NAME_MAX_LENGTH,
  createListSchema,
} from '#/lib/validation/list'

describe('createListSchema', () => {
  it('accepts a name and description at the max length', () => {
    const result = createListSchema.safeParse({
      name: 'a'.repeat(LIST_NAME_MAX_LENGTH),
      description: 'b'.repeat(LIST_DESCRIPTION_MAX_LENGTH),
    })

    expect(result.success).toBe(true)
  })

  // Issue #20, finding 4 — an unbounded name is rendered as an <h1> on the
  // public share page, so this cap keeps that layout intact.
  it('rejects a name past the max length', () => {
    const result = createListSchema.safeParse({
      name: 'a'.repeat(LIST_NAME_MAX_LENGTH + 1),
      description: null,
    })

    expect(result.success).toBe(false)
  })

  it('rejects a description past the max length', () => {
    const result = createListSchema.safeParse({
      name: 'A list',
      description: 'b'.repeat(LIST_DESCRIPTION_MAX_LENGTH + 1),
    })

    expect(result.success).toBe(false)
  })

  it('allows a null description regardless of length', () => {
    const result = createListSchema.safeParse({
      name: 'A list',
      description: null,
    })

    expect(result.success).toBe(true)
  })
})
