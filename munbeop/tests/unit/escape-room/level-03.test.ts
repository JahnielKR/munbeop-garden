import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { LEVEL_03 } from '~/seed/escape-room/level-03'
import { validateLevel } from '~/lib/escape-room/rules'

const HERE = dirname(fileURLToPath(import.meta.url))
/** Absolute path to a level-03 audio asset given its seed-relative path ('audio/...'). */
const audioPath = (rel: string) => resolve(HERE, '../../../public/escape-room/level-03/', rel)

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

  // ─── Audio wiring ───────────────────────────────────────────────────────────

  it('wires the intro/outro voice, the twist beat, and the 3-voice slot audio', () => {
    expect(LEVEL_03.voiceIntroAudio).toBe('audio/voice/voice-intro.ogg')
    expect(LEVEL_03.voiceOutroAudio).toBe('audio/voice/voice-outro.ogg')
    expect((LEVEL_03.scriptedBeats ?? [])[0]?.voiceAudio).toBe('audio/voice/voice-beat-slot4.ogg')
    // slot-1 candidates each speak their drawn favor (이모); slot-6 each the farewell (도윤)
    const slot1 = LEVEL_03.slots[0]
    slot1?.candidates.forEach((c, i) =>
      expect(c.voiceAudio).toBe(`audio/voice/voice-slot1-favor-${i + 1}.ogg`),
    )
    expect(slot1?.reactionVoiceAudio).toBe('audio/voice/voice-slot1-correct.ogg')
    const slot6 = LEVEL_03.slots[5]
    expect(slot6?.type).toBe('creation')
    if (slot6?.type !== 'creation') throw new Error('unreachable')
    slot6.candidates.forEach((c, i) => {
      expect(c.voiceAudio).toBe(`audio/voice/voice-slot6-farewell-${i + 1}.ogg`)
      expect(c.softRejectVoiceAudio).toBe('audio/voice/voice-slot6-softreject.ogg')
    })
  })

  it('every referenced audio file exists on disk under public/escape-room/level-03', () => {
    const refs = new Set<string>()
    const add = (p?: string) => {
      if (p) refs.add(p)
    }
    add(LEVEL_03.voiceIntroAudio)
    add(LEVEL_03.voiceOutroAudio)
    for (const slot of LEVEL_03.slots) {
      add(slot.reactionVoiceAudio)
      for (const c of slot.candidates) {
        add(c.voiceAudio)
        if (slot.type === 'creation') add(c.softRejectVoiceAudio)
      }
    }
    for (const beat of LEVEL_03.scriptedBeats ?? []) add(beat.voiceAudio)
    for (const room of LEVEL_03.rooms) {
      add(room.ambientAudio)
      for (const h of room.hotspots) add(h.sfx)
    }
    const missing = [...refs].filter((p) => !existsSync(audioPath(p)))
    expect(missing).toEqual([])
  })
})
