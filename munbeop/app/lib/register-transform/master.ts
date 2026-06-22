// app/lib/register-transform/master.ts
import { REGISTER_SETS } from './sets'
import type { RegisterMode } from '~/lib/domain'

export interface SetProgress { id: string; mode: RegisterMode; ko: string; done: boolean }

/** Composite key keeps the 7 mastery sets unique across modes. */
export function masteryKey(mode: string, set: string): string {
  return `${mode}:${set}`
}

const MASTER_SETS = REGISTER_SETS.filter((s) => s.mastery)
export const MASTER_KEYS = MASTER_SETS.map((s) => masteryKey(s.mode, s.id))

export function masteryOf(cleared: Set<string>) {
  const perSet: SetProgress[] = MASTER_SETS.map((s) => ({
    id: s.id,
    mode: s.mode,
    ko: s.ko,
    done: cleared.has(masteryKey(s.mode, s.id)),
  }))
  const doneCount = perSet.filter((p) => p.done).length
  return { perSet, doneCount, total: MASTER_KEYS.length, earned: doneCount === MASTER_KEYS.length }
}
