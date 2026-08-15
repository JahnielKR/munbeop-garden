import { describe, expect, it } from 'vitest'
import { validateLevel } from '~/lib/escape-room/rules'
import { LEVEL_09 } from '~/seed/escape-room/level-09'

describe('LEVEL_09 — La mansión del testamento', () => {
  it('passes structural validation', () => {
    expect(validateLevel(LEVEL_09)).toEqual([])
  })

  it('is a TOPIK 5 level with legal-reasoning grammar', () => {
    expect(LEVEL_09.id).toBe('level-09')
    expect(LEVEL_09.topikLevel).toBe(5)
    expect(LEVEL_09.grammarCodes).toEqual(['G098', 'G110', 'G195', 'G111', 'G101', 'G248'])
  })

  it('has four ordered mansion rooms and the expected final art routes', () => {
    expect(LEVEL_09.rooms.map((room) => room.id)).toEqual([
      'room-reading-hall',
      'room-ash-library',
      'room-evidence-gallery',
      'room-sealed-vault',
    ])
    expect(LEVEL_09.rooms.map((room) => room.image)).toEqual([
      'rooms/room-01-reading-hall-v2.webp',
      'rooms/room-02-ash-library-v2.webp',
      'rooms/room-03-evidence-gallery-v2.webp',
      'rooms/room-04-sealed-vault-v2.webp',
    ])
    expect(LEVEL_09.introImage).toBe('rooms/cinematic-intro-v2.webp')
    expect(LEVEL_09.outroImage).toBe('rooms/cinematic-outro-v2.webp')
  })

  it('has six slots, five candidates each, covering all three interaction types', () => {
    expect(LEVEL_09.slots.map((slot) => slot.type)).toEqual([
      'selection',
      'completion',
      'selection',
      'completion',
      'selection',
      'creation',
    ])
    expect(LEVEL_09.slots.every((slot) => slot.candidates.length === 5)).toBe(true)
    expect(LEVEL_09.slots.reduce((sum, slot) => sum + slot.candidates.length, 0)).toBe(30)
  })

  it('preserves the seven-heir and eighth-name mystery through the narrative', () => {
    expect(LEVEL_09.intro.es.toLowerCase()).toContain('siete herederos')
    expect(LEVEL_09.intro.es).toContain('un octavo nombre')
    expect(LEVEL_09.outro.es).toContain('La octava persona')
    expect(LEVEL_09.scriptedBeats?.[1]?.narrative.es).toContain('박은재')
    expect(LEVEL_09.intro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_09.outro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_09.outro.es.split('{farewell}').length - 1).toBe(1)
  })

  it('keeps every room silent until real audio assets exist', () => {
    expect(LEVEL_09.rooms.every((room) => room.ambientAudio === '')).toBe(true)
    expect(LEVEL_09.voiceIntroAudio).toBeUndefined()
    expect(LEVEL_09.voiceOutroAudio).toBeUndefined()
    for (const slot of LEVEL_09.slots) {
      expect(slot.reactionVoiceAudio).toBeUndefined()
      expect(slot.candidates.every((candidate) => candidate.voiceAudio === undefined)).toBe(true)
    }
  })

  it('provides free and premium hints for every evidence puzzle', () => {
    for (const slot of LEVEL_09.slots) {
      for (const candidate of slot.candidates) {
        expect(candidate.hints.free.es.trim().length).toBeGreaterThan(20)
        expect(candidate.hints.premium.es.trim().length).toBeGreaterThan(40)
      }
    }
  })

  it('requires the complete G110 and G111 forms, including particle allomorphy', () => {
    const causeSlot = LEVEL_09.slots[1]
    const limitationSlot = LEVEL_09.slots[3]
    expect(causeSlot?.type).toBe('completion')
    expect(limitationSlot?.type).toBe('completion')
    if (causeSlot?.type !== 'completion' || limitationSlot?.type !== 'completion') return
    expect(new Set(causeSlot.candidates.map((candidate) => candidate.answer))).toEqual(
      new Set(['으로 인해', '로 인해']),
    )
    expect(limitationSlot.candidates.every((candidate) => candidate.answer === '에 불과')).toBe(
      true,
    )
  })

  it('uses contemporary Korean voice lines and canonical rules', () => {
    expect(LEVEL_09.voiceIntro).toContain('맞추세요')
    expect(LEVEL_09.voiceOutro).toContain('열겠습니다')
    expect(LEVEL_09.rules).toEqual({
      maxErrors: 2,
      epicTimeThresholdSeconds: 600,
      legendaryCleanRunsRequired: 3,
    })
  })

  it('wires every hotspot to a real slot and defines four unique rewards', () => {
    const slotIds = new Set(LEVEL_09.slots.map((slot) => slot.id))
    for (const room of LEVEL_09.rooms) {
      for (const hotspot of room.hotspots) {
        if (hotspot.triggersSlot) expect(slotIds.has(hotspot.triggersSlot)).toBe(true)
      }
    }
    expect(LEVEL_09.scriptedBeats?.map((beat) => beat.afterSlotId)).toEqual(['slot-3', 'slot-5'])
    const rewards = Object.values(LEVEL_09.rewards)
    expect(new Set(rewards.map((reward) => reward.id)).size).toBe(4)
    expect(LEVEL_09.rewards.legendary.id).toBe('cosmetic-set-complete-09')
  })
})
