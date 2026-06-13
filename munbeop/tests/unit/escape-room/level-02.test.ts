import { describe, it, expect } from 'vitest'
import { LEVEL_02 } from '~/seed/escape-room/level-02'
import { validateLevel } from '~/lib/escape-room/rules'

describe('LEVEL_02 — El templo de la lluvia', () => {
  it('passes validateLevel with zero issues', () => {
    expect(validateLevel(LEVEL_02)).toEqual([])
  })

  it('has id "level-02"', () => {
    expect(LEVEL_02.id).toBe('level-02')
  })

  it('is anchored at TOPIK level 2', () => {
    expect(LEVEL_02.topikLevel).toBe(2)
  })

  it('references the 6 grammar codes from the dossier (G013 is the heart)', () => {
    expect([...LEVEL_02.grammarCodes].sort()).toEqual([
      'G013',
      'G016',
      'G034',
      'G035',
      'G036',
      'G050',
    ])
    expect(LEVEL_02.grammarCodes).toContain('G013')
  })

  it('has 4 rooms in order: dasil, daeungjeon, seungbang, jongnu', () => {
    expect(LEVEL_02.rooms.map((r) => r.id)).toEqual([
      'room-dasil',
      'room-daeungjeon',
      'room-seungbang',
      'room-jongnu',
    ])
  })

  it('has 6 slots in order slot-1..slot-6', () => {
    expect(LEVEL_02.slots.map((s) => s.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
    ])
  })

  it('uses the expected puzzle type per slot', () => {
    expect(LEVEL_02.slots.map((s) => s.type)).toEqual([
      'selection',
      'completion',
      'selection',
      'selection',
      'completion',
      'creation',
    ])
  })

  it('has 30 candidates total (6 slots × 5 candidates)', () => {
    const total = LEVEL_02.slots.reduce((acc, s) => acc + s.candidates.length, 0)
    expect(total).toBe(30)
  })

  it('every candidate has non-empty korean content', () => {
    for (const slot of LEVEL_02.slots) {
      for (const c of slot.candidates) {
        expect(c.korean.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('distributes the correct option across the selection pools (not always A)', () => {
    for (const slot of LEVEL_02.slots) {
      if (slot.type !== 'selection') continue
      const indices = new Set(slot.candidates.map((c) => c.correctIndex))
      expect(indices.size).toBeGreaterThan(1)
    }
  })

  it('slot-2 (전에/후에) answers are non-empty connective forms', () => {
    const slot2 = LEVEL_02.slots[1]
    expect(slot2?.type).toBe('completion')
    if (slot2?.type !== 'completion') throw new Error('unreachable')
    for (const c of slot2.candidates) {
      expect(c.answer.trim().length).toBeGreaterThan(0)
      expect(c.answer.includes('전에') || c.answer.includes('후에')).toBe(true)
    }
  })

  it('slot-5 (안/못) answers are exactly 안 or 못', () => {
    const slot5 = LEVEL_02.slots[4]
    expect(slot5?.type).toBe('completion')
    if (slot5?.type !== 'completion') throw new Error('unreachable')
    for (const c of slot5.candidates) {
      expect(['안', '못']).toContain(c.answer)
    }
  })

  it('slot-6 (farewell) carries soft-reject tiles disjoint from correctOrder + a message', () => {
    const slot6 = LEVEL_02.slots[5]
    expect(slot6?.type).toBe('creation')
    if (slot6?.type !== 'creation') throw new Error('unreachable')
    for (const c of slot6.candidates) {
      expect(c.softRejectTiles?.length).toBeGreaterThan(0)
      const correct = new Set(c.correctOrder)
      for (const idx of c.softRejectTiles ?? []) {
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(idx).toBeLessThan(c.tiles.length)
        expect(correct.has(idx)).toBe(false)
      }
      expect(c.softRejectMessage?.es?.length ?? 0).toBeGreaterThan(0)
    }
  })

  it('has two scripted beats, after slot-4 (the twist) and slot-5 (the second cup)', () => {
    const after = (LEVEL_02.scriptedBeats ?? []).map((b) => b.afterSlotId)
    expect(after).toEqual(['slot-4', 'slot-5'])
    const slotIds = new Set(LEVEL_02.slots.map((s) => s.id))
    for (const b of LEVEL_02.scriptedBeats ?? []) {
      expect(slotIds.has(b.afterSlotId)).toBe(true)
      expect(b.narrative.es.trim().length).toBeGreaterThan(0)
    }
  })

  it('the outro quotes the player via the {farewell} token exactly once', () => {
    expect(LEVEL_02.outro.es.split('{farewell}').length - 1).toBe(1)
  })

  it('has all four reward tiers with non-empty ids distinct from level 1', () => {
    const level1Ids = ['cosmetic-bg-sunrise', 'cosmetic-frame-apron', 'cosmetic-avatar-lantern', 'cosmetic-set-complete']
    for (const tier of ['common', 'rare', 'epic', 'legendary'] as const) {
      expect(LEVEL_02.rewards[tier].id.length).toBeGreaterThan(0)
      expect(level1Ids).not.toContain(LEVEL_02.rewards[tier].id)
    }
  })

  it('uses the canonical run rules (2 errors, 600s epic, 3 clean runs)', () => {
    expect(LEVEL_02.rules.maxErrors).toBe(2)
    expect(LEVEL_02.rules.epicTimeThresholdSeconds).toBe(600)
    expect(LEVEL_02.rules.legendaryCleanRunsRequired).toBe(3)
  })

  it('every hotspot that triggers a slot points to a real slot id', () => {
    const slotIds = new Set(LEVEL_02.slots.map((s) => s.id))
    for (const room of LEVEL_02.rooms) {
      for (const h of room.hotspots) {
        if (h.triggersSlot) {
          expect(slotIds.has(h.triggersSlot)).toBe(true)
        }
      }
    }
  })

  it('voice lines are Korean; intro/outro are multi-paragraph ambient narrative', () => {
    expect(LEVEL_02.voiceIntro).toContain('차')
    expect(LEVEL_02.voiceOutro).toContain('잘 가요')
    expect(LEVEL_02.intro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_02.outro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_02.tagline.es.length).toBeGreaterThan(40)
  })
})
