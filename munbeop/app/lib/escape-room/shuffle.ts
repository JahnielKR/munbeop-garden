import type { Level } from '~/lib/domain'

/**
 * Deterministic candidate selection for an escape-room run.
 *
 * Given a `Level` and an arbitrary `seed` string, picks one candidate per slot.
 * Same `(level.id + slot.id, seed)` always yields the same index — so a run
 * can be replayed exactly, and tests are reproducible.
 *
 * The hash (FNV-1a 32-bit) is statistical: different seeds map to a roughly
 * uniform distribution over `[0, candidates.length)`. Not cryptographic — not
 * intended to be.
 */

export interface DrawnSlot {
  /** Matches the `id` of the level's slot, in declaration order. */
  slotId: string
  /** Index into the slot's `candidates` array, in `[0, candidates.length)`. */
  candidateIndex: number
}

export interface DrawnRun {
  levelId: string
  seed: string
  slots: DrawnSlot[]
}

export function drawRun(level: Level, seed: string): DrawnRun {
  return {
    levelId: level.id,
    seed,
    slots: level.slots.map((slot) => ({
      slotId: slot.id,
      candidateIndex: hashPair(seed, slot.id) % slot.candidates.length,
    })),
  }
}

/** FNV-1a 32-bit hash over `a + '|' + b`. Returns an unsigned 32-bit integer. */
function hashPair(a: string, b: string): number {
  const s = `${a}|${b}`
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
