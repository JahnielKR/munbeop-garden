import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { validateLevel } from '~/lib/escape-room/rules'
import { LEVEL_06 } from '~/seed/escape-room/level-06'

const HERE = dirname(fileURLToPath(import.meta.url))
const assetPath = (rel: string) => resolve(HERE, '../../../public/escape-room/level-06/', rel)

describe('LEVEL_06 — El estudio de K-drama', () => {
  it('is a valid TOPIK 4 level with canonical run rules', () => {
    expect(validateLevel(LEVEL_06)).toEqual([])
    expect(LEVEL_06.id).toBe('level-06')
    expect(LEVEL_06.topikLevel).toBe(4)
    expect(LEVEL_06.rules).toEqual({
      maxErrors: 2,
      epicTimeThresholdSeconds: 600,
      legendaryCleanRunsRequired: 3,
    })
  })

  it('covers reported speech, stage continuity and performance nuance', () => {
    expect([...LEVEL_06.grammarCodes].sort()).toEqual(
      ['G087', 'G089', 'G090', 'G091', 'G092', 'G094'].sort(),
    )
    expect(LEVEL_06.slots.map((slot) => slot.grammarFocus)).toEqual([
      ['G089'],
      ['G090'],
      ['G091'],
      ['G087'],
      ['G094'],
      ['G092'],
    ])
  })

  it('has four ordered production rooms and six ordered language locks', () => {
    expect(LEVEL_06.rooms.map((room) => room.id)).toEqual([
      'room-script',
      'room-makeup',
      'room-set',
      'room-editing',
    ])
    expect(LEVEL_06.slots.map((slot) => slot.id)).toEqual([
      'slot-1',
      'slot-2',
      'slot-3',
      'slot-4',
      'slot-5',
      'slot-6',
    ])
    expect(LEVEL_06.slots.map((slot) => slot.type)).toEqual([
      'selection',
      'completion',
      'creation',
      'selection',
      'completion',
      'creation',
    ])
  })

  it('has exactly five candidates per slot and thirty Korean prompts total', () => {
    expect(LEVEL_06.slots.every((slot) => slot.candidates.length === 5)).toBe(true)
    expect(LEVEL_06.slots.flatMap((slot) => slot.candidates)).toHaveLength(30)
    for (const slot of LEVEL_06.slots) {
      for (const candidate of slot.candidates) expect(candidate.korean.trim()).not.toBe('')
    }
  })

  it('balances the correct options in both selection pools', () => {
    for (const slot of LEVEL_06.slots) {
      if (slot.type !== 'selection') continue
      expect(
        new Set(slot.candidates.map((candidate) => candidate.correctIndex)).size,
      ).toBeGreaterThan(2)
    }
  })

  it('gives every candidate both free and premium pedagogical hints', () => {
    for (const slot of LEVEL_06.slots) {
      for (const candidate of slot.candidates) {
        expect(candidate.hints.free.es.trim()).not.toBe('')
        expect(candidate.hints.premium.es.trim()).not.toBe('')
      }
    }
  })

  it('uses every slot as a diegetic room hotspot', () => {
    const triggers = LEVEL_06.rooms.flatMap((room) =>
      room.hotspots.flatMap((hotspot) => (hotspot.triggersSlot ? [hotspot.triggersSlot] : [])),
    )
    expect(triggers.sort()).toEqual(LEVEL_06.slots.map((slot) => slot.id).sort())
  })

  it('has Korean voice copy but no references to nonexistent audio', () => {
    expect(LEVEL_06.voiceIntro).toMatch(/[가-힣]/)
    expect(LEVEL_06.voiceOutro).toMatch(/[가-힣]/)
    expect(LEVEL_06.voiceIntroAudio).toBeUndefined()
    expect(LEVEL_06.voiceOutroAudio).toBeUndefined()
    for (const room of LEVEL_06.rooms) {
      expect(room.ambientAudio).toBe('')
      expect(room.hotspots.every((hotspot) => hotspot.sfx === undefined)).toBe(true)
    }
    for (const slot of LEVEL_06.slots) {
      expect(slot.reactionVoiceAudio).toBeUndefined()
      expect(slot.candidates.every((candidate) => candidate.voiceAudio === undefined)).toBe(true)
    }
  })

  it('has substantial cinematic narrative and two valid scripted turns', () => {
    expect(LEVEL_06.intro.es.split('\n\n')).toHaveLength(5)
    expect(LEVEL_06.outro.es.split('\n\n')).toHaveLength(5)
    expect(LEVEL_06.outro.es.split('{farewell}')).toHaveLength(2)
    expect(LEVEL_06.tagline.es.length).toBeGreaterThan(80)
    expect(LEVEL_06.scriptedBeats?.map((beat) => beat.afterSlotId)).toEqual(['slot-3', 'slot-5'])
  })

  it('declares the six final room/cinematic illustrations and they exist', () => {
    expect(LEVEL_06.introImage).toBe('rooms/cinematic-intro-v2.webp')
    expect(LEVEL_06.outroImage).toBe('rooms/cinematic-outro-v2.webp')
    expect(LEVEL_06.rooms.map((room) => room.image)).toEqual([
      'rooms/room-01-script-v2.webp',
      'rooms/room-02-makeup-v2.webp',
      'rooms/room-03-set-v2.webp',
      'rooms/room-04-editing-v2.webp',
    ])
    const assets = [
      LEVEL_06.introImage!,
      LEVEL_06.outroImage!,
      ...LEVEL_06.rooms.map((room) => room.image),
    ]
    for (const asset of assets) expect(existsSync(assetPath(asset)), asset).toBe(true)
  })

  it('offers four unique rewards reserved for this production', () => {
    const ids = Object.values(LEVEL_06.rewards).map((reward) => reward.id)
    expect(new Set(ids).size).toBe(4)
    expect(ids).toEqual([
      'cosmetic-bg-summer-studio',
      'cosmetic-frame-clapperboard',
      'cosmetic-avatar-extra-47',
      'cosmetic-set-complete-06',
    ])
  })
})
