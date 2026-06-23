import { describe, it, expect } from 'vitest'
import { LEVEL_03 } from '~/seed/escape-room/level-03'
import { validateLevel } from '~/lib/escape-room/rules'

describe('LEVEL_03 — El mercado nocturno', () => {
  it('passes validateLevel with zero issues', () => {
    expect(validateLevel(LEVEL_03)).toEqual([])
  })

  it('has id "level-03" anchored at TOPIK level 2', () => {
    expect(LEVEL_03.id).toBe('level-03')
    expect(LEVEL_03.topikLevel).toBe(2)
  })

  it('references the 6 grammar codes from the dossier (G013 is the climax callback)', () => {
    expect([...LEVEL_03.grammarCodes].sort()).toEqual([
      'G013',
      'G019',
      'G021',
      'G038',
      'G039',
      'G053',
    ])
  })

  it('has 4 rooms in order: hotteok, meokja, manmulsang, busstop', () => {
    expect(LEVEL_03.rooms.map((r) => r.id)).toEqual([
      'room-hotteok',
      'room-meokja',
      'room-manmulsang',
      'room-busstop',
    ])
  })

  it('has 6 slots in order with the sel/compl/sel/compl/sel/creation cadence', () => {
    expect(LEVEL_03.slots.map((s) => s.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
    ])
    expect(LEVEL_03.slots.map((s) => s.type)).toEqual([
      'selection',
      'completion',
      'selection',
      'completion',
      'selection',
      'creation',
    ])
  })

  it('has 30 candidates total with non-empty Korean', () => {
    let total = 0
    for (const slot of LEVEL_03.slots) {
      for (const c of slot.candidates) {
        total += 1
        expect(c.korean.trim().length).toBeGreaterThan(0)
      }
    }
    expect(total).toBe(30)
  })

  it('distributes the correct option across the selection pools (not always A)', () => {
    for (const slot of LEVEL_03.slots) {
      if (slot.type !== 'selection') continue
      const indices = new Set(slot.candidates.map((c) => c.correctIndex))
      expect(indices.size).toBeGreaterThan(1)
    }
  })

  it('slot-2 (-아/어 보다) answers end in 보세요', () => {
    const slot2 = LEVEL_03.slots[1]
    expect(slot2?.type).toBe('completion')
    if (slot2?.type !== 'completion') throw new Error('unreachable')
    for (const c of slot2.candidates) {
      expect(c.answer.trim().endsWith('보세요')).toBe(true)
    }
  })

  it('slot-4 (-지만) answers end in 지만', () => {
    const slot4 = LEVEL_03.slots[3]
    expect(slot4?.type).toBe('completion')
    if (slot4?.type !== 'completion') throw new Error('unreachable')
    for (const c of slot4.candidates) {
      expect(c.answer.trim().endsWith('지만')).toBe(true)
    }
  })

  it('slot-6 (farewell) carries soft-reject tiles disjoint from correctOrder + a message', () => {
    const slot6 = LEVEL_03.slots[5]
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

  it('has one scripted beat — the twist — after slot-4', () => {
    const after = (LEVEL_03.scriptedBeats ?? []).map((b) => b.afterSlotId)
    expect(after).toEqual(['slot-4'])
    const slotIds = new Set(LEVEL_03.slots.map((s) => s.id))
    for (const b of LEVEL_03.scriptedBeats ?? []) {
      expect(slotIds.has(b.afterSlotId)).toBe(true)
      expect(b.narrative.es.trim().length).toBeGreaterThan(0)
      expect(b.voiceLine.trim().length).toBeGreaterThan(0)
    }
  })

  it('the outro quotes the player via the {farewell} token exactly once', () => {
    expect(LEVEL_03.outro.es.split('{farewell}').length - 1).toBe(1)
  })

  it('has all four reward tiers with ids distinct from level 1 and 2', () => {
    const priorIds = [
      'cosmetic-bg-sunrise',
      'cosmetic-frame-apron',
      'cosmetic-avatar-lantern',
      'cosmetic-set-complete',
      'cosmetic-bg-rainsound',
      'cosmetic-frame-dancheong',
      'cosmetic-avatar-templecat',
      'cosmetic-set-complete-02',
    ]
    for (const tier of ['common', 'rare', 'epic', 'legendary'] as const) {
      expect(LEVEL_03.rewards[tier].id.length).toBeGreaterThan(0)
      expect(priorIds).not.toContain(LEVEL_03.rewards[tier].id)
    }
    expect(LEVEL_03.rewards.legendary.id).toBe('cosmetic-set-complete-03')
  })

  it('uses the canonical run rules (2 errors, 600s epic, 3 clean runs)', () => {
    expect(LEVEL_03.rules.maxErrors).toBe(2)
    expect(LEVEL_03.rules.epicTimeThresholdSeconds).toBe(600)
    expect(LEVEL_03.rules.legendaryCleanRunsRequired).toBe(3)
  })

  it('every hotspot that triggers a slot points to a real slot id', () => {
    const slotIds = new Set(LEVEL_03.slots.map((s) => s.id))
    for (const room of LEVEL_03.rooms) {
      for (const h of room.hotspots) {
        if (h.triggersSlot) expect(slotIds.has(h.triggersSlot)).toBe(true)
      }
    }
  })

  it('intro is 5 paragraphs; tagline is a real hook; voice lines are Korean', () => {
    expect(LEVEL_03.intro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_03.tagline.es.length).toBeGreaterThan(40)
    expect(LEVEL_03.voiceIntro.length).toBeGreaterThan(0)
    expect(LEVEL_03.voiceOutro.length).toBeGreaterThan(0)
  })
})
