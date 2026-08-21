import { describe, expect, it } from 'vitest'
import { validateLevel } from '~/lib/escape-room/rules'
import { LEVEL_10 } from '~/seed/escape-room/level-10'

describe('LEVEL_10 — La cumbre de medianoche', () => {
  it('is a complete, valid TOPIK 6 level', () => {
    expect(validateLevel(LEVEL_10)).toEqual([])
    expect(LEVEL_10.id).toBe('level-10')
    expect(LEVEL_10.topikLevel).toBe(6)
    expect(LEVEL_10.rooms).toHaveLength(4)
    expect(LEVEL_10.slots).toHaveLength(6)
  })

  it('keeps the roguelike pool and all three puzzle modes', () => {
    for (const slot of LEVEL_10.slots) expect(slot.candidates).toHaveLength(5)
    expect(new Set(LEVEL_10.slots.map((slot) => slot.type))).toEqual(
      new Set(['selection', 'completion', 'creation']),
    )
  })

  it('maps every puzzle to a diegetic hotspot', () => {
    const triggered = new Set(
      LEVEL_10.rooms.flatMap((room) =>
        room.hotspots.flatMap((hotspot) => (hotspot.triggersSlot ? [hotspot.triggersSlot] : [])),
      ),
    )
    expect(triggered).toEqual(new Set(LEVEL_10.slots.map((slot) => slot.id)))
  })

  it('has illustrated bookends, a narrative arc and unique rewards', () => {
    expect(LEVEL_10.introImage).toBe('rooms/cinematic-intro-v2.webp')
    expect(LEVEL_10.outroImage).toBe('rooms/cinematic-outro-v2.webp')
    expect(LEVEL_10.intro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_10.outro.es.split('\n\n').length).toBeGreaterThanOrEqual(4)
    expect(LEVEL_10.scriptedBeats).toHaveLength(2)
    const rewardIds = Object.values(LEVEL_10.rewards).map((reward) => reward.id)
    expect(new Set(rewardIds).size).toBe(4)
  })

  it('makes every final draw exercise both solemn emphasis and written verbal style', () => {
    const slot = LEVEL_10.slots[5]
    expect(slot?.type).toBe('creation')
    if (slot?.type !== 'creation') return
    for (const candidate of slot.candidates) {
      const sentence = candidate.correctOrder.map((index) => candidate.tiles[index]).join(' ')
      expect(sentence).toContain('야말로')
      expect(sentence).toMatch(/다$/)
      expect(sentence).not.toMatch(/이다$/)
    }
  })
})
