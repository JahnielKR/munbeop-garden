// munbeop/tests/unit/avatars/catalog.test.ts
import { describe, it, expect } from 'vitest'
import {
  AVATARS,
  AVATAR_TIERS,
  avatarUrl,
  EPIC_FRAME_URL,
  LEGENDARY_FRAME_URL,
  RARE_FRAME_URL,
  requirementLabel,
} from '~/lib/avatars/catalog'

describe('avatar catalog', () => {
  it('has exactly 36 avatars with unique ids', () => {
    expect(AVATARS).toHaveLength(36)
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(36)
  })

  it('splits into 12 / 8 / 8 / 8 by tier', () => {
    const count = (t: string) => AVATARS.filter((a) => a.tier === t).length
    expect(count('common')).toBe(12)
    expect(count('rare')).toBe(8)
    expect(count('epic')).toBe(8)
    expect(count('legendary')).toBe(8)
  })

  it('every common is unlocked by the always rule', () => {
    for (const a of AVATARS.filter((x) => x.tier === 'common')) {
      expect(a.rule.kind).toBe('always')
    }
  })

  it('non-commons never use the always rule', () => {
    for (const a of AVATARS.filter((x) => x.tier !== 'common')) {
      expect(a.rule.kind).not.toBe('always')
    }
  })

  it('exactly one collectAll avatar and it is legendary', () => {
    const ca = AVATARS.filter((a) => a.rule.kind === 'collectAll')
    expect(ca).toHaveLength(1)
    expect(ca[0]!.tier).toBe('legendary')
  })

  it('every name has ko and en text', () => {
    for (const a of AVATARS) {
      expect(a.name.ko.length).toBeGreaterThan(0)
      expect(a.name.en.length).toBeGreaterThan(0)
    }
  })

  it('avatarUrl maps id to the public png path', () => {
    expect(avatarUrl('seed')).toBe('/img/avatars/seed.png')
    expect(avatarUrl('watering-can')).toBe('/img/avatars/watering-can.png')
    expect(LEGENDARY_FRAME_URL).toBe('/img/avatars/_frame-legendary.png')
    expect(EPIC_FRAME_URL).toBe('/img/avatars/_frame-epic.png')
    expect(RARE_FRAME_URL).toBe('/img/avatars/_frame-rare.png')
  })

  it('AVATAR_TIERS is ordered common..legendary', () => {
    expect([...AVATAR_TIERS]).toEqual(['common', 'rare', 'epic', 'legendary'])
  })

  it('requirementLabel returns null for commons and a key for the rest', () => {
    expect(requirementLabel({ kind: 'always' })).toBeNull()
    expect(requirementLabel({ kind: 'trees', n: 10 })).toEqual({
      key: 'settings.avatar.req.trees',
      params: { n: 10 },
    })
    expect(requirementLabel({ kind: 'topikComplete', levels: [5, 6] })).toEqual({
      key: 'settings.avatar.req.topik',
      params: { levels: '5 & 6' },
    })
    expect(requirementLabel({ kind: 'labEarned', lab: 'particle' })).toEqual({
      key: 'settings.avatar.req.lab_particle',
      params: {},
    })
    expect(requirementLabel({ kind: 'escapeCosmetics', n: 'all' })).toEqual({
      key: 'settings.avatar.req.escape_all',
      params: {},
    })
  })

  it('requirementLabel covers the remaining rule kinds', () => {
    expect(requirementLabel({ kind: 'masteredPct', pct: 50 })).toEqual({
      key: 'settings.avatar.req.mastered_pct',
      params: { pct: 50 },
    })
    expect(requirementLabel({ kind: 'gardenComplete' })).toEqual({
      key: 'settings.avatar.req.garden_complete',
      params: {},
    })
    expect(requirementLabel({ kind: 'reviews', n: 100 })).toEqual({
      key: 'settings.avatar.req.reviews',
      params: { n: 100 },
    })
    expect(requirementLabel({ kind: 'longestStreak', n: 7 })).toEqual({
      key: 'settings.avatar.req.streak',
      params: { n: 7 },
    })
    expect(requirementLabel({ kind: 'allLabs' })).toEqual({
      key: 'settings.avatar.req.all_labs',
      params: {},
    })
    expect(requirementLabel({ kind: 'escapeCosmetics', n: 4 })).toEqual({
      key: 'settings.avatar.req.escape',
      params: { n: 4 },
    })
    expect(requirementLabel({ kind: 'flourish', trees: 100 })).toEqual({
      key: 'settings.avatar.req.flourish',
      params: { n: 100 },
    })
    expect(requirementLabel({ kind: 'collectAll' })).toEqual({
      key: 'settings.avatar.req.collect_all',
      params: {},
    })
  })
})
