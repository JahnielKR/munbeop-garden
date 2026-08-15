import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateLevel } from '~/lib/escape-room/rules'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'

const publicAsset = (url: string) => resolve(process.cwd(), 'public', url.replace(/^\/+/, ''))
const levelAsset = (levelId: string, relative: string) =>
  resolve(process.cwd(), 'public', 'escape-room', levelId, relative)

describe('complete escape-room catalog', () => {
  it('ships ten playable closed stories and 295 randomized puzzle candidates', () => {
    expect(LEVEL_REGISTRY).toHaveLength(10)
    expect(LEVEL_REGISTRY.every((entry) => entry.status === 'playable' && entry.level)).toBe(true)
    expect(LEVEL_REGISTRY.reduce((sum, entry) => sum + entry.level!.slots.length, 0)).toBe(59)
    expect(
      LEVEL_REGISTRY.reduce(
        (sum, entry) =>
          sum +
          entry.level!.slots.reduce((slotSum, slot) => slotSum + slot.candidates.length, 0),
        0,
      ),
    ).toBe(295)
  })

  it('keeps every level structurally valid and every lock reachable exactly once', () => {
    for (const entry of LEVEL_REGISTRY) {
      const level = entry.level!
      expect(validateLevel(level), entry.id).toEqual([])
      expect(level.rooms, entry.id).toHaveLength(4)
      expect(level.slots.length, entry.id).toBeGreaterThanOrEqual(5)
      expect(level.slots.length, entry.id).toBeLessThanOrEqual(6)
      expect(new Set(level.slots.map((slot) => slot.type)), entry.id).toEqual(
        new Set(['selection', 'completion', 'creation']),
      )

      const triggers = level.rooms.flatMap((room) =>
        room.hotspots.flatMap((hotspot) => (hotspot.triggersSlot ? [hotspot.triggersSlot] : [])),
      )
      expect(triggers.sort(), entry.id).toEqual(level.slots.map((slot) => slot.id).sort())

      for (const room of level.rooms) {
        for (const hotspot of room.hotspots) {
          const [x, y, width, height] = hotspot.rect
          expect(x, `${entry.id}/${room.id}/${hotspot.id}: x`).toBeGreaterThanOrEqual(0)
          expect(y, `${entry.id}/${room.id}/${hotspot.id}: y`).toBeGreaterThanOrEqual(0)
          expect(width, `${entry.id}/${room.id}/${hotspot.id}: width`).toBeGreaterThanOrEqual(1)
          expect(height, `${entry.id}/${room.id}/${hotspot.id}: height`).toBeGreaterThanOrEqual(1)
          expect(x + width, `${entry.id}/${room.id}/${hotspot.id}: right`).toBeLessThanOrEqual(320)
          expect(y + height, `${entry.id}/${room.id}/${hotspot.id}: bottom`).toBeLessThanOrEqual(240)
        }
      }
    }
  })

  it('keeps every randomized candidate distinct, readable and tied to the level curriculum', () => {
    for (const entry of LEVEL_REGISTRY) {
      const level = entry.level!
      expect(level.intro.es.split(/\n\s*\n/).length, `${entry.id}: intro`).toBeGreaterThanOrEqual(2)
      expect(level.outro.es.split(/\n\s*\n/).length, `${entry.id}: outro`).toBeGreaterThanOrEqual(2)

      for (const slot of level.slots) {
        expect(
          slot.grammarFocus.every((code) => level.grammarCodes.includes(code)),
          `${entry.id}/${slot.id}: grammarFocus`,
        ).toBe(true)
        const candidateSignatures = slot.candidates.map((candidate) =>
          JSON.stringify({
            korean: candidate.korean,
            ...('answer' in candidate ? { answer: candidate.answer } : {}),
            ...('options' in candidate ? { options: candidate.options.map((option) => option.es) } : {}),
            ...('tiles' in candidate
              ? { tiles: candidate.tiles, correctOrder: candidate.correctOrder }
              : {}),
          }),
        )
        expect(new Set(candidateSignatures).size, `${entry.id}/${slot.id}: candidates`).toBe(
          slot.candidates.length,
        )

        for (const candidate of slot.candidates) {
          expect(candidate.korean.trim().length, `${entry.id}/${slot.id}: korean`).toBeGreaterThan(0)
          expect(candidate.hints.free.es.trim().length, `${entry.id}/${slot.id}: free hint`).toBeGreaterThan(4)
          expect(candidate.hints.premium.es.trim().length, `${entry.id}/${slot.id}: premium hint`).toBeGreaterThan(4)

          if (slot.type === 'selection') {
            expect(
              new Set(candidate.options.map((option) => option.es.trim())).size,
              `${entry.id}/${slot.id}: options`,
            ).toBe(4)
          } else if (slot.type === 'completion') {
            expect(candidate.translation.es.trim().length, `${entry.id}/${slot.id}: translation`).toBeGreaterThan(4)
            const resolved = candidate.korean.replace('___', candidate.answer)
            expect(resolved, `${entry.id}/${slot.id}: unresolved blank`).not.toContain('___')
            expect(resolved, `${entry.id}/${slot.id}: space before punctuation`).not.toMatch(
              /\s+[.!?]/u,
            )
            if (/^(?:이|가|에 따라서?|기에 앞서|에도 불구하고|(?:으)?로 인해|에 불과)$/u.test(candidate.answer)) {
              expect(candidate.korean, `${entry.id}/${slot.id}: detached particle`).not.toMatch(
                /\s___/u,
              )
            }
          } else {
            expect(candidate.correctOrder.length, `${entry.id}/${slot.id}: answer tiles`).toBeGreaterThanOrEqual(2)
            expect(candidate.tiles.length, `${entry.id}/${slot.id}: answer capacity`).toBeGreaterThanOrEqual(
              candidate.correctOrder.length,
            )
          }
        }
      }
    }
  })

  it('references real grammar entries from the TOPIK spine', () => {
    const spine = readFileSync(resolve(process.cwd(), 'app/seed/topik-spine.json'), 'utf8')
    const known = new Set([...spine.matchAll(/"id"\s*:\s*"(G\d+)"/g)].map((match) => match[1]))
    for (const entry of LEVEL_REGISTRY) {
      for (const code of entry.level!.grammarCodes) {
        expect(known.has(code), entry.id + ': ' + code).toBe(true)
      }
      for (const slot of entry.level!.slots) {
        for (const code of slot.grammarFocus) {
          expect(known.has(code), entry.id + ': ' + code).toBe(true)
        }
      }
    }
  })

  it('ships every cover, cinematic, room and reward image referenced by the catalog', () => {
    for (const entry of LEVEL_REGISTRY) {
      const level = entry.level!
      const assets = [
        publicAsset(entry.cover),
        levelAsset(entry.id, level.introImage!),
        levelAsset(entry.id, level.outroImage!),
        ...level.rooms.flatMap((room) => [
          levelAsset(entry.id, room.image),
          ...(room.solvedImage ? [levelAsset(entry.id, room.solvedImage)] : []),
        ]),
        ...Object.values(level.rewards).map((reward) => levelAsset(entry.id, reward.image)),
      ]
      for (const asset of assets) {
        expect(existsSync(asset), asset).toBe(true)
        expect(statSync(asset).size, asset).toBeGreaterThan(500)
      }
    }
  })

  it('ships the four interaction sounds used by every playable level', () => {
    for (const entry of LEVEL_REGISTRY) {
      for (const filename of [
        'sfx-correct.ogg',
        'sfx-wrong.ogg',
        'sfx-select.ogg',
        'sfx-door-wood.ogg',
      ]) {
        const asset = levelAsset(entry.id, `audio/${filename}`)
        expect(existsSync(asset), asset).toBe(true)
        expect(statSync(asset).size, asset).toBeGreaterThan(500)
      }
    }
  })

  it('never references a missing narrative, ambient or hotspot audio file', () => {
    for (const entry of LEVEL_REGISTRY) {
      const level = entry.level!
      const references = [
        level.voiceIntroAudio,
        level.voiceOutroAudio,
        level.bellTollAudio,
        level.rainStopAudio,
        ...level.rooms.flatMap((room) => [
          room.ambientAudio,
          ...room.hotspots.map((hotspot) => hotspot.sfx),
        ]),
        ...level.slots.flatMap((slot) => [
          slot.reactionVoiceAudio,
          ...slot.candidates.flatMap((candidate) => [
            candidate.voiceAudio,
            ...('softRejectVoiceAudio' in candidate
              ? [candidate.softRejectVoiceAudio]
              : []),
          ]),
        ]),
        ...(level.scriptedBeats?.map((beat) => beat.voiceAudio) ?? []),
      ].filter((reference): reference is string => !!reference)

      for (const reference of references) {
        const asset = levelAsset(entry.id, reference)
        expect(existsSync(asset), asset).toBe(true)
        expect(statSync(asset).size, asset).toBeGreaterThan(500)
      }
    }
  })

  it('uses globally unique reward ids so persistence cannot unlock the wrong cosmetic', () => {
    const ids = LEVEL_REGISTRY.flatMap((entry) =>
      Object.values(entry.level!.rewards).map((reward) => reward.id),
    )
    expect(new Set(ids).size).toBe(ids.length)
  })
})
