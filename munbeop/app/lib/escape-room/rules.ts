import type { Level } from '~/lib/domain'

/**
 * Level invariants and validation.
 *
 * `validateLevel(level)` returns an array of `ValidationIssue` describing every
 * problem found. Empty array = the level is well-formed. The validator never
 * short-circuits: a level with multiple issues reports all of them, so the
 * author sees the full picture in one pass.
 *
 * Used at level-load time and inside tests over `seed/escape-room/level-*.ts`.
 */

/** Number of candidates each slot must carry (the pool). */
export const POOL_SIZE = 5

/** Number of options in a selection (Tipo A) puzzle. */
export const SELECTION_OPTIONS_COUNT = 4

/** Marker used in completion (Tipo B) korean strings for the blank. */
export const COMPLETION_BLANK = '___'

export interface ValidationIssue {
  /** Human-readable path inside the Level structure, e.g. `slots[1].candidates[0].answer`. */
  path: string
  /** Short description of what's wrong. */
  message: string
}

export function validateLevel(level: Level): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  /**
   * Optional audio paths must, when present, be non-empty strings. An empty
   * string would silently play nothing — flag it so the author notices.
   */
  function checkOptionalAudio(value: string | undefined, path: string) {
    if (value !== undefined && value.trim().length === 0) {
      issues.push({ path, message: 'audio path must not be empty when present' })
    }
  }

  // ─── Level-level optional audio ───────────────────────────────────────────
  checkOptionalAudio(level.voiceIntroAudio, 'voiceIntroAudio')
  checkOptionalAudio(level.voiceOutroAudio, 'voiceOutroAudio')
  checkOptionalAudio(level.bellTollAudio, 'bellTollAudio')
  checkOptionalAudio(level.rainStopAudio, 'rainStopAudio')

  // ─── Slot id uniqueness ───────────────────────────────────────────────────
  const slotIds = new Set<string>()
  for (let i = 0; i < level.slots.length; i++) {
    const slot = level.slots[i]!
    if (slotIds.has(slot.id)) {
      issues.push({
        path: `slots[${i}].id`,
        message: `duplicate slot id "${slot.id}"`,
      })
    } else {
      slotIds.add(slot.id)
    }
  }

  // ─── Per-slot / per-candidate validation ──────────────────────────────────
  for (let i = 0; i < level.slots.length; i++) {
    const slot = level.slots[i]!
    const slotPath = `slots[${i}](${slot.id})`

    checkOptionalAudio(slot.reactionVoiceAudio, `${slotPath}.reactionVoiceAudio`)
    for (let j = 0; j < slot.candidates.length; j++) {
      checkOptionalAudio(slot.candidates[j]!.voiceAudio, `${slotPath}.candidates[${j}].voiceAudio`)
    }

    if (slot.candidates.length !== POOL_SIZE) {
      issues.push({
        path: `${slotPath}.candidates`,
        message: `expected ${POOL_SIZE} candidates, found ${slot.candidates.length}`,
      })
    }

    if (slot.type === 'selection') {
      for (let j = 0; j < slot.candidates.length; j++) {
        const c = slot.candidates[j]!
        const cPath = `${slotPath}.candidates[${j}]`
        if (c.options.length !== SELECTION_OPTIONS_COUNT) {
          issues.push({
            path: `${cPath}.options`,
            message: `expected ${SELECTION_OPTIONS_COUNT} options, found ${c.options.length}`,
          })
        }
        if (c.correctIndex < 0 || c.correctIndex > 3) {
          issues.push({
            path: `${cPath}.correctIndex`,
            message: `correctIndex must be 0–3, got ${c.correctIndex}`,
          })
        }
      }
    } else if (slot.type === 'completion') {
      for (let j = 0; j < slot.candidates.length; j++) {
        const c = slot.candidates[j]!
        const cPath = `${slotPath}.candidates[${j}]`
        const blankCount = c.korean.split(COMPLETION_BLANK).length - 1
        if (blankCount !== 1) {
          issues.push({
            path: `${cPath}.korean`,
            message: `completion korean must contain exactly one "${COMPLETION_BLANK}" blank, found ${blankCount}`,
          })
        }
        if (c.answer.trim().length === 0) {
          issues.push({
            path: `${cPath}.answer`,
            message: 'answer must not be empty',
          })
        }
      }
    } else {
      // creation
      for (let j = 0; j < slot.candidates.length; j++) {
        const c = slot.candidates[j]!
        const cPath = `${slotPath}.candidates[${j}]`
        checkOptionalAudio(c.softRejectVoiceAudio, `${cPath}.softRejectVoiceAudio`)
        const tileCount = c.tiles.length
        for (const idx of c.correctOrder) {
          if (idx < 0 || idx >= tileCount) {
            issues.push({
              path: `${cPath}.correctOrder`,
              message: `correctOrder index ${idx} is out of range (tiles.length=${tileCount})`,
            })
          }
        }
        const unique = new Set(c.correctOrder)
        if (unique.size !== c.correctOrder.length) {
          issues.push({
            path: `${cPath}.correctOrder`,
            message: 'correctOrder must not contain duplicate indices',
          })
        }
        if (c.softRejectTiles) {
          const correctSet = new Set(c.correctOrder)
          for (const idx of c.softRejectTiles) {
            if (idx < 0 || idx >= tileCount) {
              issues.push({
                path: `${cPath}.softRejectTiles`,
                message: `softRejectTiles index ${idx} is out of range (tiles.length=${tileCount})`,
              })
            }
            if (correctSet.has(idx)) {
              issues.push({
                path: `${cPath}.softRejectTiles`,
                message: `softRejectTiles index ${idx} also appears in correctOrder (must be disjoint)`,
              })
            }
          }
          const softUnique = new Set(c.softRejectTiles)
          if (softUnique.size !== c.softRejectTiles.length) {
            issues.push({
              path: `${cPath}.softRejectTiles`,
              message: 'softRejectTiles must not contain duplicate indices',
            })
          }
          // A soft-reject with no message would be a silent no-op in the UI.
          if (c.softRejectTiles.length > 0 && !c.softRejectMessage) {
            issues.push({
              path: `${cPath}.softRejectMessage`,
              message: 'softRejectMessage is required when softRejectTiles is set',
            })
          }
        }
      }
    }
  }

  // ─── Scripted beats reference real slots ──────────────────────────────────
  if (level.scriptedBeats) {
    for (let b = 0; b < level.scriptedBeats.length; b++) {
      const beat = level.scriptedBeats[b]!
      checkOptionalAudio(beat.voiceAudio, `scriptedBeats[${b}].voiceAudio`)
      if (!slotIds.has(beat.afterSlotId)) {
        issues.push({
          path: `scriptedBeats[${b}].afterSlotId`,
          message: `references unknown slot "${beat.afterSlotId}"`,
        })
      }
    }
  }

  // ─── Hotspot triggersSlot references ──────────────────────────────────────
  for (let r = 0; r < level.rooms.length; r++) {
    const room = level.rooms[r]!
    if (room.solvedImage !== undefined && room.solvedImage.trim().length === 0) {
      issues.push({ path: `rooms[${r}].solvedImage`, message: 'solvedImage must not be empty when present' })
    }
    for (let h = 0; h < room.hotspots.length; h++) {
      const hotspot = room.hotspots[h]!
      checkOptionalAudio(hotspot.sfx, `rooms[${r}].hotspots[${h}].sfx`)
      if (hotspot.triggersSlot && !slotIds.has(hotspot.triggersSlot)) {
        issues.push({
          path: `rooms[${r}].hotspots[${h}].triggersSlot`,
          message: `triggers unknown slot "${hotspot.triggersSlot}"`,
        })
      }
    }
  }

  // ─── Rules sanity ─────────────────────────────────────────────────────────
  if (level.rules.maxErrors < 1) {
    issues.push({ path: 'rules.maxErrors', message: 'maxErrors must be ≥ 1' })
  }
  if (level.rules.epicTimeThresholdSeconds <= 0) {
    issues.push({
      path: 'rules.epicTimeThresholdSeconds',
      message: 'epicTimeThresholdSeconds must be > 0',
    })
  }
  if (level.rules.legendaryCleanRunsRequired < 1) {
    issues.push({
      path: 'rules.legendaryCleanRunsRequired',
      message: 'legendaryCleanRunsRequired must be ≥ 1',
    })
  }

  return issues
}
