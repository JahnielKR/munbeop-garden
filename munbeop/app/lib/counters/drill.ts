import type { Counter, CountItem } from '~/lib/domain'
import { COUNT_ITEMS } from '~/seed/counters'
import { buildDistractors } from './distractors'

/** Stable per-item id (CountItem has no id field). */
export function itemId(i: CountItem): string {
  return `${i.counterId}::${i.quantity}::${i.noun}`
}

/** Items whose counter id is in the given set. */
export function itemsForSet(counterIds: string[], source: CountItem[] = COUNT_ITEMS): CountItem[] {
  const set = new Set(counterIds)
  return source.filter((i) => set.has(i.counterId))
}

/** Answer first, then the 3 distractors (the composable shuffles for display). */
export function optionsFor(item: CountItem, counters: readonly Counter[]): string[] {
  return [item.answer, ...buildDistractors(item, counters)]
}

export function buildRound(
  counterIds: string[],
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
  source: CountItem[] = COUNT_ITEMS,
): CountItem[] {
  return shuffleFn(itemsForSet(counterIds, source)).slice(0, n)
}

export interface DrillResult { itemId: string; correct: boolean }
export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
