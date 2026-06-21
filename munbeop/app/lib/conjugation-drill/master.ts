// app/lib/conjugation-drill/master.ts
import { DRILL_CLASSES } from './drill'
import type { VerbClass } from '~/lib/korean'

/** The 9 real classes (mixed is a play mode, not a mastery unit). */
export const MASTER_CLASS_IDS: VerbClass[] = DRILL_CLASSES.filter(
  (c) => c.klass !== 'mixed',
).map((c) => c.klass as VerbClass)

export interface ClassProgress {
  klass: VerbClass
  ko: string
  done: boolean
}

export function masteryOf(cleared: Set<string>) {
  const perClass: ClassProgress[] = DRILL_CLASSES.filter((c) => c.klass !== 'mixed').map((c) => ({
    klass: c.klass as VerbClass,
    ko: c.ko,
    done: cleared.has(c.klass),
  }))
  const doneCount = perClass.filter((p) => p.done).length
  return { perClass, doneCount, total: MASTER_CLASS_IDS.length, earned: doneCount === MASTER_CLASS_IDS.length }
}
