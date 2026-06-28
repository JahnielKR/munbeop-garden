// munbeop/tests/unit/avatars/portrait-cache.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  readPortraitCache,
  writePortraitCache,
  clearPortraitCache,
} from '~/lib/avatars/portrait-cache'

describe('portrait device cache', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing is cached', () => {
    expect(readPortraitCache()).toBeNull()
  })

  it('round-trips a written value', () => {
    writePortraitCache({ chosenAvatarId: 'fox', unlockedAvatarIds: ['fox', 'koi'] })
    expect(readPortraitCache()).toEqual({ chosenAvatarId: 'fox', unlockedAvatarIds: ['fox', 'koi'] })
  })

  it('round-trips the "no avatar chosen" state', () => {
    writePortraitCache({ chosenAvatarId: null, unlockedAvatarIds: [] })
    expect(readPortraitCache()).toEqual({ chosenAvatarId: null, unlockedAvatarIds: [] })
  })

  it('clear removes the cache', () => {
    writePortraitCache({ chosenAvatarId: 'fox', unlockedAvatarIds: ['fox'] })
    clearPortraitCache()
    expect(readPortraitCache()).toBeNull()
  })

  it('sanitises a malformed blob (wrong types) instead of trusting it', () => {
    localStorage.setItem(
      'mungarden:portrait',
      JSON.stringify({ chosenAvatarId: 42, unlockedAvatarIds: ['bee', 7, 'koi'] }),
    )
    expect(readPortraitCache()).toEqual({ chosenAvatarId: null, unlockedAvatarIds: ['bee', 'koi'] })
  })

  it('returns null on unparseable JSON', () => {
    localStorage.setItem('mungarden:portrait', '{not json')
    expect(readPortraitCache()).toBeNull()
  })
})
