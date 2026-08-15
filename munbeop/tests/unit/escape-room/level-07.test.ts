import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateLevel } from '~/lib/escape-room/rules'
import { LEVEL_07 } from '~/seed/escape-room/level-07'

const HERE = dirname(fileURLToPath(import.meta.url))
const assetPath = (rel: string) => resolve(HERE, '../../../public/escape-room/level-07/', rel)

describe('LEVEL_07 — El retiro de la empresa', () => {
  it('is a valid TOPIK 4 level with canonical run rules', () => {
    expect(validateLevel(LEVEL_07)).toEqual([])
    expect(LEVEL_07.id).toBe('level-07')
    expect(LEVEL_07.topikLevel).toBe(4)
    expect(LEVEL_07.rules).toEqual({
      maxErrors: 2,
      epicTimeThresholdSeconds: 600,
      legendaryCleanRunsRequired: 3,
    })
  })

  it('covers honorifics, formal instructions and teamwork rhetoric', () => {
    expect([...LEVEL_07.grammarCodes].sort()).toEqual(
      ['G011', 'G018', 'G080', 'G082', 'G097', 'G174', 'G175'].sort(),
    )
    expect(LEVEL_07.slots.map((slot) => slot.grammarFocus)).toEqual([
      ['G011', 'G018'],
      ['G175'],
      ['G097'],
      ['G174'],
      ['G082'],
      ['G080'],
    ])
  })

  it('has four ordered retreat rooms and six balanced puzzle locks', () => {
    expect(LEVEL_07.rooms.map((room) => room.id)).toEqual([
      'room-lodge',
      'room-briefing',
      'room-trail',
      'room-campfire',
    ])
    expect(LEVEL_07.slots.map((slot) => slot.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
    ])
    expect(LEVEL_07.slots.map((slot) => slot.type)).toEqual([
      'selection',
      'completion',
      'creation',
      'selection',
      'completion',
      'creation',
    ])
  })

  it('has five candidates in every slot, thirty total, all with Korean content', () => {
    expect(LEVEL_07.slots.every((slot) => slot.candidates.length === 5)).toBe(true)
    expect(LEVEL_07.slots.flatMap((slot) => slot.candidates)).toHaveLength(30)
    for (const slot of LEVEL_07.slots) {
      for (const candidate of slot.candidates) expect(candidate.korean.trim()).not.toBe('')
    }
  })

  it('distributes selection answers and supplies both hint tiers everywhere', () => {
    for (const slot of LEVEL_07.slots) {
      if (slot.type === 'selection') {
        expect(
          new Set(slot.candidates.map((candidate) => candidate.correctIndex)).size,
        ).toBeGreaterThan(2)
      }
      for (const candidate of slot.candidates) {
        expect(candidate.hints.free.es.trim()).not.toBe('')
        expect(candidate.hints.premium.es.trim()).not.toBe('')
      }
    }
  })

  it('uses every slot exactly once as a diegetic hotspot', () => {
    const triggers = LEVEL_07.rooms.flatMap((room) =>
      room.hotspots.flatMap((hotspot) => (hotspot.triggersSlot ? [hotspot.triggersSlot] : [])),
    )
    expect(triggers.sort()).toEqual(LEVEL_07.slots.map((slot) => slot.id).sort())
  })

  it('keeps Korean voice copy and deliberately references no audio files', () => {
    expect(LEVEL_07.voiceIntro).toMatch(/[가-힣]/)
    expect(LEVEL_07.voiceOutro).toMatch(/[가-힣]/)
    expect(LEVEL_07.voiceIntroAudio).toBeUndefined()
    expect(LEVEL_07.voiceOutroAudio).toBeUndefined()
    for (const room of LEVEL_07.rooms) {
      expect(room.ambientAudio).toBe('')
      expect(room.hotspots.every((hotspot) => hotspot.sfx === undefined)).toBe(true)
    }
    for (const slot of LEVEL_07.slots) {
      expect(slot.reactionVoiceAudio).toBeUndefined()
      expect(slot.candidates.every((candidate) => candidate.voiceAudio === undefined)).toBe(true)
    }
  })

  it('has five-paragraph cinematics, a dynamic finale, and two valid story beats', () => {
    expect(LEVEL_07.intro.es.split('\n\n')).toHaveLength(5)
    expect(LEVEL_07.outro.es.split('\n\n')).toHaveLength(5)
    expect(LEVEL_07.outro.es.split('{farewell}')).toHaveLength(2)
    expect(LEVEL_07.tagline.es.length).toBeGreaterThan(80)
    expect(LEVEL_07.scriptedBeats?.map((beat) => beat.afterSlotId)).toEqual(['slot-2', 'slot-5'])
  })

  it('declares the six final room/cinematic illustrations and they exist', () => {
    expect(LEVEL_07.introImage).toBe('rooms/cinematic-intro-v2.webp')
    expect(LEVEL_07.outroImage).toBe('rooms/cinematic-outro-v2.webp')
    expect(LEVEL_07.rooms.map((room) => room.image)).toEqual([
      'rooms/room-01-lodge-v2.webp',
      'rooms/room-02-briefing-v2.webp',
      'rooms/room-03-trail-v2.webp',
      'rooms/room-04-campfire-v2.webp',
    ])
    const assets = [
      LEVEL_07.introImage!,
      LEVEL_07.outroImage!,
      ...LEVEL_07.rooms.map((room) => room.image),
    ]
    for (const asset of assets) expect(existsSync(assetPath(asset)), asset).toBe(true)
  })

  it('offers four unique rewards for this retreat', () => {
    const ids = Object.values(LEVEL_07.rewards).map((reward) => reward.id)
    expect(new Set(ids).size).toBe(4)
    expect(ids).toEqual([
      'cosmetic-bg-night-retreat',
      'cosmetic-frame-team-badges',
      'cosmetic-avatar-radio-lead',
      'cosmetic-set-complete-07',
    ])
  })
})
