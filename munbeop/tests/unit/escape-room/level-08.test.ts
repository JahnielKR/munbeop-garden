import { describe, expect, it } from 'vitest'
import { validateLevel } from '~/lib/escape-room/rules'
import { LEVEL_08 } from '~/seed/escape-room/level-08'

describe('LEVEL_08 — El palacio de las linternas', () => {
  it('passes structural validation', () => {
    expect(validateLevel(LEVEL_08)).toEqual([])
  })

  it('is a TOPIK 5 level with six advanced grammar targets', () => {
    expect(LEVEL_08.id).toBe('level-08')
    expect(LEVEL_08.topikLevel).toBe(5)
    expect(LEVEL_08.grammarCodes).toEqual(['G099', 'G098', 'G238', 'G227', 'G189', 'G107'])
  })

  it('has four ordered palace rooms and the expected final art routes', () => {
    expect(LEVEL_08.rooms.map((room) => room.id)).toEqual([
      'room-byeoksa',
      'room-gyujanggak',
      'room-cheomseong',
      'room-wolmun',
    ])
    expect(LEVEL_08.rooms.map((room) => room.image)).toEqual([
      'rooms/room-01-byeoksa-v2.webp',
      'rooms/room-02-gyujanggak-v2.webp',
      'rooms/room-03-cheomseong-v2.webp',
      'rooms/room-04-wolmun-v2.webp',
    ])
    expect(LEVEL_08.introImage).toBe('rooms/cinematic-intro-v2.webp')
    expect(LEVEL_08.outroImage).toBe('rooms/cinematic-outro-v2.webp')
  })

  it('has six slots, five candidates each, covering all three interaction types', () => {
    expect(LEVEL_08.slots.map((slot) => slot.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
    ])
    expect(LEVEL_08.slots.map((slot) => slot.type)).toEqual([
      'selection',
      'completion',
      'selection',
      'completion',
      'selection',
      'creation',
    ])
    expect(LEVEL_08.slots.every((slot) => slot.candidates.length === 5)).toBe(true)
    expect(LEVEL_08.slots.reduce((sum, slot) => sum + slot.candidates.length, 0)).toBe(30)
  })

  it('keeps every room silent until real audio assets exist', () => {
    expect(LEVEL_08.rooms.every((room) => room.ambientAudio === '')).toBe(true)
    expect(LEVEL_08.voiceIntroAudio).toBeUndefined()
    expect(LEVEL_08.voiceOutroAudio).toBeUndefined()
    for (const slot of LEVEL_08.slots) {
      expect(slot.reactionVoiceAudio).toBeUndefined()
      expect(slot.candidates.every((candidate) => candidate.voiceAudio === undefined)).toBe(true)
    }
  })

  it('provides free and premium teaching hints for every candidate', () => {
    for (const slot of LEVEL_08.slots) {
      for (const candidate of slot.candidates) {
        expect(candidate.hints.free.es.trim().length).toBeGreaterThan(20)
        expect(candidate.hints.premium.es.trim().length).toBeGreaterThan(40)
      }
    }
  })

  it('uses contemporary Korean voice lines despite the historical atmosphere', () => {
    expect(LEVEL_08.voiceIntro).toContain('주세요')
    expect(LEVEL_08.voiceOutro).toContain('필요가 없어요')
    expect(LEVEL_08.voiceIntro).not.toMatch(/[하오]|[하]옵니다/)
    expect(LEVEL_08.intro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_08.outro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_08.outro.es.split('{farewell}').length - 1).toBe(1)
  })

  it('has valid slot hotspots, two narrative beats, and canonical run rules', () => {
    const slotIds = new Set(LEVEL_08.slots.map((slot) => slot.id))
    for (const room of LEVEL_08.rooms) {
      for (const hotspot of room.hotspots) {
        if (hotspot.triggersSlot) expect(slotIds.has(hotspot.triggersSlot)).toBe(true)
      }
    }
    expect(LEVEL_08.scriptedBeats?.map((beat) => beat.afterSlotId)).toEqual(['slot-2', 'slot-5'])
    expect(LEVEL_08.rules).toEqual({
      maxErrors: 2,
      epicTimeThresholdSeconds: 600,
      legendaryCleanRunsRequired: 3,
    })
  })

  it('defines four unique level rewards', () => {
    const rewards = Object.values(LEVEL_08.rewards)
    expect(rewards).toHaveLength(4)
    expect(new Set(rewards.map((reward) => reward.id)).size).toBe(4)
    expect(
      rewards.every((reward) => reward.id.includes('08') || !reward.id.includes('complete')),
    ).toBe(true)
  })
})
