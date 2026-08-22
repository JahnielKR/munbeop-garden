// app/lib/cloze/drill.ts
import type { ClozeItem } from '~/lib/domain'
import { CLOZE_ITEMS } from '~/seed/cloze'

/** Stable per-item id (ClozeItem has no id field). */
export function itemId(i: ClozeItem): string {
  return `${i.ko}::${i.sentence}`
}

/** Items whose ko is in the given set of grammar points. */
export function itemsForKos(kos: string[], source: ClozeItem[] = CLOZE_ITEMS): ClozeItem[] {
  const set = new Set(kos)
  return source.filter((i) => set.has(i.ko))
}

/** answer first, then the 3 distractors (stable; the composable shuffles for display). */
export function optionsFor(item: ClozeItem): string[] {
  return [item.answer, ...item.distractors]
}

export function buildRound(
  kos: string[],
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
  source: ClozeItem[] = CLOZE_ITEMS,
): ClozeItem[] {
  return shuffleFn(itemsForKos(kos, source)).slice(0, n)
}

export interface DrillResult { itemId: string; ko: string; correct: boolean }
export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
