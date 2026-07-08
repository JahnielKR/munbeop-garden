// app/lib/practice/lab-mastery.ts
//
// Lab-mastery progress used to live in GLOBAL localStorage keys
// ('conjugation-lab.cleared', 'number-market.speed.best', …) that were neither
// scoped by user nor cleared on sign-out. On a shared device a second account
// inherited the first's badges, and via useAvatars.syncUnlocks() those inherited
// unlocks were persisted permanently into the second account's cloud settings.
//
// The fix moves this progress into the account-synced settings blob (the same
// per-user discipline the escape-room cosmetics already follow). This module
// owns the shared types + the one-time migration of the old global keys.

export type ClearedLabId = 'conjugation' | 'counter' | 'register' | 'numberMarket'
/** Particle mastery is derived from SRS (already per-user); only its sticky
 *  "earned" acknowledgement was a global localStorage flag, so it joins here. */
export type EarnedLabId = ClearedLabId | 'particle'

export const CLEARED_LAB_IDS: readonly ClearedLabId[] = [
  'conjugation',
  'counter',
  'register',
  'numberMarket',
]
export const EARNED_LAB_IDS: readonly EarnedLabId[] = [...CLEARED_LAB_IDS, 'particle']

export type LabClearedMap = Record<ClearedLabId, string[]>
export type LabEarnedMap = Record<EarnedLabId, boolean>
export type SpeedBestMap = Record<string, number>

export function emptyLabCleared(): LabClearedMap {
  return { conjugation: [], counter: [], register: [], numberMarket: [] }
}
export function emptyLabEarned(): LabEarnedMap {
  return { conjugation: false, counter: false, register: false, numberMarket: false, particle: false }
}

// The pre-sync GLOBAL localStorage keys.
const LEGACY_CLEARED: Record<ClearedLabId, string> = {
  conjugation: 'conjugation-lab.cleared',
  counter: 'counter-lab.cleared',
  register: 'register-lab.cleared',
  numberMarket: 'number-market.cleared',
}
const LEGACY_EARNED: Record<EarnedLabId, string> = {
  conjugation: 'conjugation-lab.masterEarned',
  counter: 'counter-lab.masterEarned',
  register: 'register-lab.masterEarned',
  numberMarket: 'number-market.masterEarned',
  particle: 'particle-lab.masterEarned',
}
const LEGACY_SPEED_BEST = 'number-market.speed.best'

export interface LegacyLabProgress {
  cleared: LabClearedMap
  earned: LabEarnedMap
  speedBest: SpeedBestMap
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* SSR / quota — ignore */
  }
}

/**
 * Read the old global lab keys WITHOUT deleting them, returning the adopted
 * progress plus whether anything was found. The settings store calls this once,
 * when the signed-in account has no lab data yet, to seed its blob from the
 * device's pre-sync progress. The read is non-destructive so the caller can
 * delete the keys only AFTER a confirmed cloud persist (clearLegacyLabProgress)
 * — otherwise a swallowed write failure would lose the just-deleted progress
 * with no source to recover from. Safe when localStorage is unavailable.
 */
export function readLegacyLabProgress(): { progress: LegacyLabProgress; found: boolean } {
  const progress: LegacyLabProgress = {
    cleared: emptyLabCleared(),
    earned: emptyLabEarned(),
    speedBest: {},
  }
  let found = false
  if (typeof localStorage === 'undefined') return { progress, found }

  for (const lab of CLEARED_LAB_IDS) {
    const arr = readStringArray(LEGACY_CLEARED[lab])
    if (arr.length) {
      progress.cleared[lab] = arr
      found = true
    }
  }
  for (const lab of EARNED_LAB_IDS) {
    if (safeGet(LEGACY_EARNED[lab]) === '1') {
      progress.earned[lab] = true
      found = true
    }
  }
  const best = readNumberRecord(LEGACY_SPEED_BEST)
  if (Object.keys(best).length) {
    progress.speedBest = best
    found = true
  }

  return { progress, found }
}

/**
 * Delete every legacy global lab key. Called only after the adopted progress
 * has been persisted to the account's cloud blob, so a *different* account on
 * the same device can never adopt them again (the original cross-account leak).
 */
export function clearLegacyLabProgress(): void {
  if (typeof localStorage === 'undefined') return
  for (const lab of CLEARED_LAB_IDS) safeRemove(LEGACY_CLEARED[lab])
  for (const lab of EARNED_LAB_IDS) safeRemove(LEGACY_EARNED[lab])
  safeRemove(LEGACY_SPEED_BEST)
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function readStringArray(key: string): string[] {
  const raw = safeGet(key)
  if (raw == null) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function readNumberRecord(key: string): Record<string, number> {
  const raw = safeGet(key)
  if (raw == null) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const out: Record<string, number> = {}
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'number' && v >= 0) out[k] = v
    }
    return out
  } catch {
    return {}
  }
}
