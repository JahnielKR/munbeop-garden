import { describe, it, expect } from 'vitest'
import { levelOfDeck } from '~/lib/library/topik-level'

describe('levelOfDeck', () => {
  it('maps each TOPIK deck id to its numeric level', () => {
    expect(levelOfDeck('topik-1')).toBe(1)
    expect(levelOfDeck('topik-3')).toBe(3)
    expect(levelOfDeck('topik-6')).toBe(6)
  })

  it('returns null for the custom deck and unknown ids', () => {
    expect(levelOfDeck('custom')).toBeNull()
    expect(levelOfDeck('topik-7')).toBeNull()
    expect(levelOfDeck('topik-0')).toBeNull()
    expect(levelOfDeck('')).toBeNull()
    expect(levelOfDeck('topik-1x')).toBeNull()
  })
})
