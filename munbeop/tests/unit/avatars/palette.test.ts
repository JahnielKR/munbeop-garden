// munbeop/tests/unit/avatars/palette.test.ts
import { describe, it, expect } from 'vitest'
import { AVATARS, AVATAR_BG, avatarBg } from '~/lib/avatars/catalog'

const HEX = /^#[0-9a-f]{6}$/i

describe('avatar chip palette', () => {
  it('every catalog avatar has a chip colour', () => {
    const missing = AVATARS.filter((a) => !AVATAR_BG[a.id]).map((a) => a.id)
    expect(missing).toEqual([])
  })

  it('AVATAR_BG has no keys that are not avatar ids', () => {
    const ids = new Set(AVATARS.map((a) => a.id))
    const extra = Object.keys(AVATAR_BG).filter((k) => !ids.has(k))
    expect(extra).toEqual([])
  })

  it('every chip colour is a 6-digit hex', () => {
    const bad = Object.entries(AVATAR_BG)
      .filter(([, hex]) => !HEX.test(hex))
      .map(([id]) => id)
    expect(bad).toEqual([])
  })

  it('avatarBg resolves a known id and falls back for an unknown one', () => {
    expect(avatarBg('seed')).toBe(AVATAR_BG.seed)
    expect(avatarBg('seed')).toMatch(HEX)
    expect(avatarBg('not-an-avatar')).toMatch(HEX)
  })

  it('offers real variety (the whole point — not one shared colour)', () => {
    const distinct = new Set(Object.values(AVATAR_BG).map((h) => h.toLowerCase()))
    expect(distinct.size).toBeGreaterThanOrEqual(24)
  })
})
