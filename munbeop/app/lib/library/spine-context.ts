import { allItems, type GrammarItemWithSource, type GrammarSource } from '~/lib/domain'

/**
 * Where a grammar sits in the curricular spine, for the study-sheet breadcrumb.
 * Returns the item's {@link GrammarSource} (TOPIK level+theme, or a transversal
 * section) or `null` when the ko isn't in the spine (e.g. user custom grammar).
 *
 * The spine is static, so the ko→source index is built once and memoized. Tests
 * can inject their own item list to stay independent of the real spine.
 */
let memo: Map<string, GrammarSource> | null = null

function index(): Map<string, GrammarSource> {
  if (!memo) {
    memo = new Map()
    for (const it of allItems()) if (!memo.has(it.ko)) memo.set(it.ko, it.source)
  }
  return memo
}

export function spineContextOf(
  ko: string,
  items?: readonly GrammarItemWithSource[],
): GrammarSource | null {
  if (items) return items.find((it) => it.ko === ko)?.source ?? null
  return index().get(ko) ?? null
}
