import { describe, it, expect } from 'vitest'
import { DEFAULT_CONTEXTS } from '~/seed/contexts'
import { LOCALE_CODES } from '~/lib/domain'

const CATEGORIES = ['formalidad', 'situacional', 'custom']
const nonEmptyLocales = (o: unknown) =>
  LOCALE_CODES.every((c) => ((o as Record<string, string>)?.[c]?.trim().length ?? 0) > 0)

describe('contexts seed invariants', () => {
  it('has a healthy pool of builtin contexts', () => {
    expect(DEFAULT_CONTEXTS.length).toBeGreaterThanOrEqual(20)
  })

  it('every id is unique', () => {
    const ids = DEFAULT_CONTEXTS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const [i, c] of DEFAULT_CONTEXTS.entries()) {
    it(`#${i} ${c.id} is well-formed`, () => {
      expect(c.id.trim().length).toBeGreaterThan(0)
      expect(c.name.trim().length).toBeGreaterThan(0)
      expect(CATEGORIES).toContain(c.category)
      expect(c.builtin).toBe(true)
      expect(nonEmptyLocales(c.scene), 'scene 8 locales').toBe(true)
    })
  }
})
