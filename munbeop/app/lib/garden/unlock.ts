/**
 * Unlock gates for trees (levels) and zones (themes) — spec §4.3 / §4.4.
 *
 * Pure functions over progress percentages; no Vue, no stores.
 */

/** Progress of level N-1 required to plant tree N. Bloom at 80 is the
 * celebration; gating at 60 avoids a hard wall and keeps the flow. */
export const TREE_GATE_PCT = 60

/** Progress of theme i-1 required to open theme i (linear chain, v1). */
export const ZONE_GATE_PCT = 50

/** Tree 1 is always unlocked; tree N needs progress(N-1) >= TREE_GATE_PCT. */
export function isTreeUnlocked(level: number, progressOf: (lvl: number) => number): boolean {
  return level <= 1 || progressOf(level - 1) >= TREE_GATE_PCT
}

/**
 * How many zones are open given the ordered theme progresses of a level.
 * Zone 0 is always open; each zone opens when the previous one reaches
 * ZONE_GATE_PCT. The chain stops at the first zone below the gate.
 */
export function unlockedZoneCount(themeProgresses: number[]): number {
  let open = 1
  for (let i = 0; i < themeProgresses.length - 1; i++) {
    if (themeProgresses[i]! >= ZONE_GATE_PCT) open = i + 2
    else break
  }
  return Math.min(open, themeProgresses.length)
}
