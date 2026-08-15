import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateLevel } from '~/lib/escape-room/rules'
import { LEVEL_04 } from '~/seed/escape-room/level-04'

const HERE = dirname(fileURLToPath(import.meta.url))
const assetPath = (rel: string) => resolve(HERE, '../../../public/escape-room/level-04/', rel)

describe('LEVEL_04 — El último tren a Seúl', () => {
  it('is a valid TOPIK 3 level with canonical run rules', () => {
    expect(validateLevel(LEVEL_04)).toEqual([])
    expect(LEVEL_04.id).toBe('level-04')
    expect(LEVEL_04.topikLevel).toBe(3)
    expect(LEVEL_04.rules).toEqual({
      maxErrors: 2,
      epicTimeThresholdSeconds: 600,
      legendaryCleanRunsRequired: 3,
    })
  })

  it('uses six TOPIK 3 grammar points tied to station decisions', () => {
    expect(LEVEL_04.grammarCodes).toEqual(['G073', 'G067', 'G062', 'G069', 'G063', 'G060'])
    const declared = new Set(LEVEL_04.grammarCodes)
    for (const slot of LEVEL_04.slots) {
      for (const code of slot.grammarFocus)
        expect(declared.has(code), `${slot.id}: ${code}`).toBe(true)
    }
  })

  it('has four rooms in narrative order with the final art paths', () => {
    expect(LEVEL_04.rooms.map((room) => room.id)).toEqual([
      'room-ticket-hall',
      'room-control-room',
      'room-platform-two',
      'room-final-platform',
    ])
    expect(LEVEL_04.rooms.map((room) => room.image)).toEqual([
      'rooms/room-01-ticket-hall-v2.webp',
      'rooms/room-02-control-room-v2.webp',
      'rooms/room-03-platform-two-v2.webp',
      'rooms/room-04-final-platform-v2.webp',
    ])
    expect(LEVEL_04.introImage).toBe('rooms/cinematic-intro-v2.webp')
    expect(LEVEL_04.outroImage).toBe('rooms/cinematic-outro-v2.webp')
  })

  it('ships every illustration referenced by the seed', () => {
    const refs = [LEVEL_04.introImage, LEVEL_04.outroImage, ...LEVEL_04.rooms.map((r) => r.image)]
    for (const ref of refs) {
      expect(ref, 'art path must be present').toBeTruthy()
      expect(existsSync(assetPath(ref!)), ref).toBe(true)
    }
  })

  it('has six progressive slots with a balanced 2/2/2 puzzle cadence', () => {
    expect(LEVEL_04.slots.map((slot) => slot.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
    ])
    expect(LEVEL_04.slots.map((slot) => slot.type)).toEqual([
      'selection',
      'completion',
      'creation',
      'selection',
      'completion',
      'creation',
    ])
    expect(LEVEL_04.slots.reduce((total, slot) => total + slot.candidates.length, 0)).toBe(30)
    for (const slot of LEVEL_04.slots) expect(slot.candidates).toHaveLength(5)
  })

  it('keeps every candidate mechanically playable', () => {
    for (const slot of LEVEL_04.slots) {
      for (const candidate of slot.candidates) {
        expect(candidate.korean.trim().length).toBeGreaterThan(0)
        expect(candidate.hints.free.es.trim().length).toBeGreaterThan(0)
        expect(candidate.hints.premium.es.trim().length).toBeGreaterThan(0)
        if (slot.type === 'selection') {
          expect(candidate.options).toHaveLength(4)
          expect(candidate.correctIndex).toBeGreaterThanOrEqual(0)
          expect(candidate.correctIndex).toBeLessThan(4)
        } else if (slot.type === 'completion') {
          expect(candidate.korean.split('___')).toHaveLength(2)
          expect(candidate.answer.trim().length).toBeGreaterThan(0)
        } else {
          expect(candidate.correctOrder.length).toBeGreaterThan(1)
          expect(new Set(candidate.correctOrder).size).toBe(candidate.correctOrder.length)
          for (const index of candidate.correctOrder) {
            expect(index).toBeGreaterThanOrEqual(0)
            expect(index).toBeLessThan(candidate.tiles.length)
          }
        }
      }
    }
  })

  it('varies correct positions in both selection pools', () => {
    for (const slot of LEVEL_04.slots.filter((s) => s.type === 'selection')) {
      if (slot.type !== 'selection') continue
      expect(new Set(slot.candidates.map((c) => c.correctIndex)).size).toBeGreaterThan(1)
    }
  })

  it('makes every G069 deduction recognize the Korean conjecture form', () => {
    const slot = LEVEL_04.slots[3]
    expect(slot?.type).toBe('selection')
    if (slot?.type !== 'selection') return
    for (const candidate of slot.candidates) {
      expect(candidate.options[candidate.correctIndex]?.es).toContain('것 같아요')
    }
  })

  it('maps every slot to one and only one narrative hotspot', () => {
    const triggers = LEVEL_04.rooms.flatMap((room) =>
      room.hotspots.flatMap((hotspot) => (hotspot.triggersSlot ? [hotspot.triggersSlot] : [])),
    )
    expect(triggers.sort()).toEqual(LEVEL_04.slots.map((slot) => slot.id).sort())
  })

  it('uses silent room ambience and references no nonexistent audio', () => {
    expect(LEVEL_04.rooms.every((room) => room.ambientAudio === '')).toBe(true)
    expect(LEVEL_04.voiceIntroAudio).toBeUndefined()
    expect(LEVEL_04.voiceOutroAudio).toBeUndefined()
    expect(LEVEL_04.bellTollAudio).toBeUndefined()
    expect(LEVEL_04.rainStopAudio).toBeUndefined()
    for (const room of LEVEL_04.rooms) {
      for (const hotspot of room.hotspots) expect(hotspot.sfx).toBeUndefined()
    }
    for (const slot of LEVEL_04.slots) {
      expect(slot.reactionVoiceAudio).toBeUndefined()
      for (const candidate of slot.candidates) expect(candidate.voiceAudio).toBeUndefined()
    }
  })

  it('delivers the station-closing reveal before the playable final announcement', () => {
    expect((LEVEL_04.scriptedBeats ?? []).map((beat) => beat.afterSlotId)).toEqual([
      'slot-4',
      'slot-5',
    ])
    expect(LEVEL_04.intro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_04.outro.es.split('\n\n').length).toBeGreaterThanOrEqual(5)
    expect(LEVEL_04.outro.es.split('{farewell}')).toHaveLength(2)
    expect(LEVEL_04.voiceIntro).toMatch(/[가-힣]/)
    expect(LEVEL_04.voiceOutro).toMatch(/[가-힣]/)
  })

  it('defines four unique reward ids', () => {
    const ids = Object.values(LEVEL_04.rewards).map((reward) => reward.id)
    expect(new Set(ids).size).toBe(4)
    expect(ids).toEqual([
      'cosmetic-bg-rainy-rails',
      'cosmetic-frame-paper-ticket',
      'cosmetic-avatar-green-lamp',
      'cosmetic-set-complete-04',
    ])
    for (const reward of Object.values(LEVEL_04.rewards)) {
      expect(existsSync(assetPath(reward.image)), reward.image).toBe(true)
    }
  })
})
