import { describe, it, expect } from 'vitest'
import { filterPoolByCustomDeck } from '~/lib/practice'

const CATALOG = ['-아서', '-니까', '-는데', '-거든요']
const indexOfKo = (ko: string) => {
  const i = CATALOG.indexOf(ko)
  return i < 0 ? undefined : i
}

describe('filterPoolByCustomDeck', () => {
  it('maps grammar kos to their catalog indices, preserving order', () => {
    expect(filterPoolByCustomDeck(['-니까', '-아서'], indexOfKo)).toEqual([1, 0])
  })
  it('drops kos missing from the catalog (deleted/renamed items)', () => {
    expect(filterPoolByCustomDeck(['-아서', '-gone', '-는데'], indexOfKo)).toEqual([0, 2])
  })
  it('returns empty when nothing resolves', () => {
    expect(filterPoolByCustomDeck(['-x', '-y'], indexOfKo)).toEqual([])
  })
})
