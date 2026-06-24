import { describe, it, expect } from 'vitest'
import {
  POOL_SIZE,
  SELECTION_OPTIONS_COUNT,
  validateLevel,
} from '~/lib/escape-room/rules'
import type { Level, Slot } from '~/lib/domain'
import { makeLevel, ls } from './_fixture'

const replaceSlot = (level: Level, slotId: string, replacement: Slot): Level => ({
  ...level,
  slots: level.slots.map((s) => (s.id === slotId ? replacement : s)),
})

const issueContains = (haystack: { path: string; message: string }[], needle: string) =>
  haystack.some((i) => i.path.includes(needle) || i.message.includes(needle))

describe('validateLevel', () => {
  it('returns no issues for a valid fixture', () => {
    expect(validateLevel(makeLevel())).toEqual([])
  })

  it('exposes POOL_SIZE = 5 and SELECTION_OPTIONS_COUNT = 4', () => {
    expect(POOL_SIZE).toBe(5)
    expect(SELECTION_OPTIONS_COUNT).toBe(4)
  })

  it('flags an empty room solvedImage but accepts a non-empty one', () => {
    const level = makeLevel()
    const withSolved = (img: string): Level => ({
      ...level,
      rooms: level.rooms.map((r, i) => (i === 0 ? { ...r, solvedImage: img } : r)),
    })
    expect(issueContains(validateLevel(withSolved('   ')), 'solvedImage')).toBe(true)
    expect(validateLevel(withSolved('rooms/x-solved.png'))).toEqual([])
  })

  it('flags a slot whose pool size is not 5', () => {
    const level = makeLevel()
    const slot = level.slots[0]
    if (slot?.type !== 'selection') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.slice(0, 4),
    })
    const issues = validateLevel(broken)
    expect(issueContains(issues, 'slot-1')).toBe(true)
    expect(issueContains(issues, 'candidates')).toBe(true)
  })

  it('flags a selection candidate with correctIndex out of [0,3]', () => {
    const level = makeLevel()
    const slot = level.slots[0]
    if (slot?.type !== 'selection') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) =>
        i === 2 ? { ...c, correctIndex: 4 as 0 | 1 | 2 | 3 } : c,
      ),
    })
    const issues = validateLevel(broken)
    expect(issueContains(issues, 'correctIndex')).toBe(true)
  })

  it('flags a completion candidate missing the ___ blank', () => {
    const level = makeLevel()
    const slot = level.slots[1]
    if (slot?.type !== 'completion') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) =>
        i === 0 ? { ...c, korean: '책상에 있어요.' } : c,
      ),
    })
    expect(issueContains(validateLevel(broken), 'blank')).toBe(true)
  })

  it('flags a completion candidate with more than one ___ blank', () => {
    const level = makeLevel()
    const slot = level.slots[1]
    if (slot?.type !== 'completion') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) =>
        i === 0 ? { ...c, korean: '책___ ___에 있어요.' } : c,
      ),
    })
    expect(issueContains(validateLevel(broken), 'blank')).toBe(true)
  })

  it('flags a completion candidate with an empty answer', () => {
    const level = makeLevel()
    const slot = level.slots[1]
    if (slot?.type !== 'completion') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) => (i === 0 ? { ...c, answer: '  ' } : c)),
    })
    expect(issueContains(validateLevel(broken), 'answer')).toBe(true)
  })

  it('flags a creation candidate with an out-of-range index in correctOrder', () => {
    const level = makeLevel()
    const slot = level.slots[2]
    if (slot?.type !== 'creation') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) =>
        i === 0 ? { ...c, correctOrder: [0, 99] } : c,
      ),
    })
    expect(issueContains(validateLevel(broken), 'correctOrder')).toBe(true)
  })

  it('flags a creation candidate with duplicate indices in correctOrder', () => {
    const level = makeLevel()
    const slot = level.slots[2]
    if (slot?.type !== 'creation') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) =>
        i === 0 ? { ...c, correctOrder: [0, 0] } : c,
      ),
    })
    expect(issueContains(validateLevel(broken), 'correctOrder')).toBe(true)
  })

  it('accepts a creation candidate with valid softRejectTiles', () => {
    const level = makeLevel()
    const slot = level.slots[2]
    if (slot?.type !== 'creation') throw new Error('fixture changed')
    const ok = replaceSlot(level, slot.id, {
      ...slot,
      // tiles are ['카페에','가요','학교에'], correctOrder [0,1] → index 2 is a free distractor
      candidates: slot.candidates.map((c) => ({
        ...c,
        softRejectTiles: [2],
        softRejectMessage: ls('nudge'),
      })),
    })
    expect(validateLevel(ok)).toEqual([])
  })

  it('flags softRejectTiles index out of range', () => {
    const level = makeLevel()
    const slot = level.slots[2]
    if (slot?.type !== 'creation') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) => (i === 0 ? { ...c, softRejectTiles: [99] } : c)),
    })
    expect(issueContains(validateLevel(broken), 'softRejectTiles')).toBe(true)
  })

  it('flags softRejectTiles that overlap correctOrder (must be disjoint)', () => {
    const level = makeLevel()
    const slot = level.slots[2]
    if (slot?.type !== 'creation') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      // correctOrder is [0,1]; reusing index 0 as a soft tile is illegal
      candidates: slot.candidates.map((c, i) => (i === 0 ? { ...c, softRejectTiles: [0] } : c)),
    })
    expect(issueContains(validateLevel(broken), 'softRejectTiles')).toBe(true)
  })

  it('flags duplicate indices in softRejectTiles', () => {
    const level = makeLevel()
    const slot = level.slots[2]
    if (slot?.type !== 'creation') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) =>
        i === 0 ? { ...c, softRejectTiles: [2, 2], softRejectMessage: ls('nudge') } : c,
      ),
    })
    expect(issueContains(validateLevel(broken), 'softRejectTiles')).toBe(true)
  })

  it('flags softRejectTiles set without a softRejectMessage', () => {
    const level = makeLevel()
    const slot = level.slots[2]
    if (slot?.type !== 'creation') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) => (i === 0 ? { ...c, softRejectTiles: [2] } : c)),
    })
    expect(issueContains(validateLevel(broken), 'softRejectMessage')).toBe(true)
  })

  it('flags a scripted beat whose afterSlotId references an unknown slot', () => {
    const broken = makeLevel({
      scriptedBeats: [{ afterSlotId: 'slot-ghost', voiceLine: 'x', narrative: ls('beat') }],
    })
    expect(issueContains(validateLevel(broken), 'slot-ghost')).toBe(true)
  })

  it('accepts a scripted beat that references a real slot', () => {
    const ok = makeLevel({
      scriptedBeats: [{ afterSlotId: 'slot-1', voiceLine: 'x', narrative: ls('beat') }],
    })
    expect(validateLevel(ok)).toEqual([])
  })

  it('flags a hotspot whose triggersSlot points to an unknown slot', () => {
    const level = makeLevel()
    const broken: Level = {
      ...level,
      rooms: level.rooms.map((r, i) =>
        i === 0
          ? {
              ...r,
              hotspots: [
                { id: 'h-x', rect: [0, 0, 10, 10], triggersSlot: 'slot-ghost' },
              ],
            }
          : r,
      ),
    }
    expect(issueContains(validateLevel(broken), 'slot-ghost')).toBe(true)
  })

  it('flags duplicate slot ids', () => {
    const level = makeLevel()
    const a = level.slots[0]!
    const b = level.slots[1]!
    const broken: Level = {
      ...level,
      slots: [a, { ...b, id: a.id }, level.slots[2]!],
    }
    expect(issueContains(validateLevel(broken), 'duplicate')).toBe(true)
  })

  it('flags rules.maxErrors < 1', () => {
    const broken = makeLevel({ rules: { maxErrors: 0, epicTimeThresholdSeconds: 480, legendaryCleanRunsRequired: 3 } })
    expect(issueContains(validateLevel(broken), 'maxErrors')).toBe(true)
  })

  it('flags rules.epicTimeThresholdSeconds <= 0', () => {
    const broken = makeLevel({ rules: { maxErrors: 2, epicTimeThresholdSeconds: 0, legendaryCleanRunsRequired: 3 } })
    expect(issueContains(validateLevel(broken), 'epicTimeThresholdSeconds')).toBe(true)
  })

  it('flags rules.legendaryCleanRunsRequired < 1', () => {
    const broken = makeLevel({ rules: { maxErrors: 2, epicTimeThresholdSeconds: 480, legendaryCleanRunsRequired: 0 } })
    expect(issueContains(validateLevel(broken), 'legendaryCleanRunsRequired')).toBe(true)
  })

  it('accumulates multiple issues without short-circuiting', () => {
    const level = makeLevel({ rules: { maxErrors: 0, epicTimeThresholdSeconds: 0, legendaryCleanRunsRequired: 0 } })
    const issues = validateLevel(level)
    expect(issues.length).toBeGreaterThanOrEqual(3)
  })

  it('uses ls() helper so LocalizedString fixtures stay terse', () => {
    // sanity: the test fixture helper itself produces valid LocalizedStrings
    const v = ls('x')
    expect(v.en).toBe('x')
    expect(v.ja).toBe('x')
  })

  // ─── Optional audio fields ──────────────────────────────────────────────────

  it('accepts optional audio fields when they are non-empty strings', () => {
    const level = makeLevel()
    const slot = level.slots[0]
    if (slot?.type !== 'selection') throw new Error('fixture changed')
    const ok: Level = {
      ...replaceSlot(level, slot.id, {
        ...slot,
        reactionVoiceAudio: 'audio/voice/r.ogg',
        candidates: slot.candidates.map((c) => ({ ...c, voiceAudio: 'audio/voice/c.ogg' })),
      }),
      voiceIntroAudio: 'audio/voice/intro.ogg',
      voiceOutroAudio: 'audio/voice/outro.ogg',
      bellTollAudio: 'audio/sfx-bell.ogg',
      rainStopAudio: 'audio/sfx-rain.ogg',
    }
    ok.rooms = ok.rooms.map((r, i) =>
      i === 0
        ? { ...r, hotspots: r.hotspots.map((h) => ({ ...h, sfx: 'audio/sfx-tick.ogg' })) }
        : r,
    )
    expect(validateLevel(ok)).toEqual([])
  })

  it('flags a level-level audio field present but empty', () => {
    const broken = makeLevel({ voiceIntroAudio: '   ' })
    expect(issueContains(validateLevel(broken), 'voiceIntroAudio')).toBe(true)
  })

  it('flags a slot reactionVoiceAudio present but empty', () => {
    const level = makeLevel()
    const slot = level.slots[0]
    if (slot?.type !== 'selection') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, { ...slot, reactionVoiceAudio: '' })
    expect(issueContains(validateLevel(broken), 'reactionVoiceAudio')).toBe(true)
  })

  it('flags a candidate voiceAudio present but empty', () => {
    const level = makeLevel()
    const slot = level.slots[0]
    if (slot?.type !== 'selection') throw new Error('fixture changed')
    const broken = replaceSlot(level, slot.id, {
      ...slot,
      candidates: slot.candidates.map((c, i) => (i === 0 ? { ...c, voiceAudio: '' } : c)),
    })
    expect(issueContains(validateLevel(broken), 'voiceAudio')).toBe(true)
  })

  it('flags a hotspot sfx present but empty', () => {
    const level = makeLevel()
    const broken: Level = {
      ...level,
      rooms: level.rooms.map((r, i) =>
        i === 0
          ? { ...r, hotspots: [{ id: 'h-x', rect: [0, 0, 10, 10], sfx: '  ' }] }
          : r,
      ),
    }
    expect(issueContains(validateLevel(broken), 'sfx')).toBe(true)
  })
})
