import type { SrsState } from '~/lib/domain'

/** A point counts as learned once its mastery is past seedling. */
export function isLearned(state: SrsState | undefined): boolean {
  return state?.mastery === 'plant' || state?.mastery === 'tree'
}

export interface PathItem {
  ko: string
  learned: boolean
}

export interface PathProgress {
  items: PathItem[]
  total: number
  learned: number
  /** 0..1 */
  pct: number
  /** First not-learned ko in order, or null when the path is complete. */
  nextKo: string | null
}

export function pathProgress(kos: string[], srsMap: Record<string, SrsState>): PathProgress {
  const items: PathItem[] = kos.map((ko) => ({ ko, learned: isLearned(srsMap[ko]) }))
  const learned = items.filter((i) => i.learned).length
  const total = items.length
  const nextKo = items.find((i) => !i.learned)?.ko ?? null
  return { items, total, learned, pct: total === 0 ? 0 : learned / total, nextKo }
}
