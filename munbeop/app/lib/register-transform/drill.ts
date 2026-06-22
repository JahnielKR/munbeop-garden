// app/lib/register-transform/drill.ts
import type { RegisterItem, RegisterMode } from '~/lib/domain'
import { REGISTER_ITEMS } from '~/seed/register-transform'

/** Stable per-item id (RegisterItem has no id field). */
export function itemId(i: RegisterItem): string {
  return `${i.source}=>${i.answer}`
}

/** Items of a mode, optionally narrowed to a set ('mixed' = all of the mode). */
export function itemsFor(
  mode: RegisterMode,
  set: string = 'mixed',
  source: RegisterItem[] = REGISTER_ITEMS,
): RegisterItem[] {
  const byMode = source.filter((i) => i.mode === mode)
  return set === 'mixed' ? byMode : byMode.filter((i) => i.set === set)
}

/** answer first, then the 3 distractors (stable order; the composable shuffles for display). */
export function optionsFor(item: RegisterItem): string[] {
  return [item.answer, ...item.distractors]
}

export function buildRound(
  mode: RegisterMode,
  set: string,
  n: number,
  shuffleFn: <T>(xs: T[]) => T[],
  source: RegisterItem[] = REGISTER_ITEMS,
): RegisterItem[] {
  return shuffleFn(itemsFor(mode, set, source)).slice(0, n)
}

export interface DrillResult { itemId: string; correct: boolean }
export interface DrillScore { correct: number; total: number; accuracy: number }

export function scoreOf(results: DrillResult[]): DrillScore {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  return { correct, total, accuracy: total === 0 ? 0 : correct / total }
}
