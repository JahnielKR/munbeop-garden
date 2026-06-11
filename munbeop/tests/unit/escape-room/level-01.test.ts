import { describe, it, expect } from 'vitest'
import { LEVEL_01 } from '~/seed/escape-room/level-01'
import { validateLevel } from '~/lib/escape-room/rules'

describe('LEVEL_01 — Una mañana en el minbak', () => {
  it('passes validateLevel with zero issues', () => {
    expect(validateLevel(LEVEL_01)).toEqual([])
  })

  it('has id "level-01"', () => {
    expect(LEVEL_01.id).toBe('level-01')
  })

  it('is anchored at TOPIK level 1', () => {
    expect(LEVEL_01.topikLevel).toBe(1)
  })

  it('references the 6 grammar codes from the dossier', () => {
    expect([...LEVEL_01.grammarCodes].sort()).toEqual([
      'G003',
      'G005',
      'G012',
      'G027',
      'G031',
      'G032',
    ])
  })

  it('has 4 rooms in order: bedroom, living, kitchen, entrance', () => {
    expect(LEVEL_01.rooms.map((r) => r.id)).toEqual([
      'room-bedroom',
      'room-living',
      'room-kitchen',
      'room-entrance',
    ])
  })

  it('has 5 slots in order slot-1..slot-5', () => {
    expect(LEVEL_01.slots.map((s) => s.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
    ])
  })

  it('uses the expected puzzle type per slot', () => {
    expect(LEVEL_01.slots.map((s) => s.type)).toEqual([
      'selection',
      'completion',
      'selection',
      'creation',
      'creation',
    ])
  })

  it('has 25 candidates total (5 slots × 5 candidates)', () => {
    const total = LEVEL_01.slots.reduce((acc, s) => acc + s.candidates.length, 0)
    expect(total).toBe(25)
  })

  it('every candidate has non-empty korean content', () => {
    for (const slot of LEVEL_01.slots) {
      for (const c of slot.candidates) {
        expect(c.korean.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('slot-2 (이/가) candidates all answer with 이 or 가', () => {
    const slot2 = LEVEL_01.slots[1]
    expect(slot2?.type).toBe('completion')
    if (slot2?.type !== 'completion') throw new Error('unreachable')
    for (const c of slot2.candidates) {
      expect(['이', '가']).toContain(c.answer)
    }
  })

  it('has all four reward tiers defined with non-empty ids', () => {
    for (const tier of ['common', 'rare', 'epic', 'legendary'] as const) {
      expect(LEVEL_01.rewards[tier].id.length).toBeGreaterThan(0)
    }
  })

  it('uses the canonical run rules (2 errors, 480s epic, 3 clean runs)', () => {
    expect(LEVEL_01.rules.maxErrors).toBe(2)
    expect(LEVEL_01.rules.epicTimeThresholdSeconds).toBe(480)
    expect(LEVEL_01.rules.legendaryCleanRunsRequired).toBe(3)
  })

  it('every hotspot that triggers a slot points to a real slot id', () => {
    const slotIds = new Set(LEVEL_01.slots.map((s) => s.id))
    for (const room of LEVEL_01.rooms) {
      for (const h of room.hotspots) {
        if (h.triggersSlot) {
          expect(slotIds.has(h.triggersSlot)).toBe(true)
        }
      }
    }
  })

  it('voice lines are Korean; intro/outro are multi-paragraph ambient narrative', () => {
    expect(LEVEL_01.voiceIntro).toContain('안녕')
    expect(LEVEL_01.voiceOutro).toContain('카페')
    // Narrative paragraphs are separated by blank lines for the cinematic.
    expect(LEVEL_01.intro.es.split('\n\n').length).toBeGreaterThanOrEqual(3)
    expect(LEVEL_01.outro.es.split('\n\n').length).toBeGreaterThanOrEqual(2)
    expect(LEVEL_01.tagline.es.length).toBeGreaterThan(10)
  })
})
