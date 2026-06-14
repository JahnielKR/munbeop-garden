import type { Grammar, GrammarType, LocaleCode, TopikLevel } from '~/lib/domain'
import { localized } from '~/lib/domain'

export interface LibraryFilter {
  query: string
  level: TopikLevel | null
  category: GrammarType | null
  /** ko allow-set from ?theme= (garden deep-link); null = no theme filter. */
  themeKos: Set<string> | null
}

export interface SearchContext {
  locale: LocaleCode
  levelOf: (ko: string) => TopikLevel | undefined
  categoryOf: (ko: string) => GrammarType | undefined
}

/** Normalize for matching: NFC (compose Hangul), trim, lowercase (Latin). */
export function normalize(s: string): string {
  return s.normalize('NFC').trim().toLowerCase()
}

const SCORE = {
  KO_EXACT: 100,
  KO_PREFIX: 80,
  KO_SUBSTR: 60,
  MEANING_WORD: 40,
  MEANING_SUBSTR: 25,
  TEXT_SUBSTR: 10, // example or trans
} as const

/** Relevance score for one item against an already-normalized query `q`. */
export function scoreItem(it: Grammar, q: string, locale: LocaleCode): number {
  const ko = normalize(it.ko)
  if (ko === q) return SCORE.KO_EXACT
  let best = 0
  if (ko.startsWith(q)) best = Math.max(best, SCORE.KO_PREFIX)
  else if (ko.includes(q)) best = Math.max(best, SCORE.KO_SUBSTR)

  const meaning = normalize(localized(it.meaning, locale))
  if (meaning) {
    if ((' ' + meaning).includes(' ' + q)) best = Math.max(best, SCORE.MEANING_WORD)
    else if (meaning.includes(q)) best = Math.max(best, SCORE.MEANING_SUBSTR)
  }
  if (it.example && normalize(it.example).includes(q)) best = Math.max(best, SCORE.TEXT_SUBSTR)
  if (it.trans && normalize(localized(it.trans, locale)).includes(q)) best = Math.max(best, SCORE.TEXT_SUBSTR)
  return best
}

/**
 * Filter (AND over level/category/theme) then rank. With no query, returns
 * filtered items in stable level-then-original-order. With a query, returns
 * only positive-score items, sorted by score desc, then level asc, then index.
 */
export function searchLibrary(items: Grammar[], filter: LibraryFilter, ctx: SearchContext): Grammar[] {
  const q = normalize(filter.query)
  const lvlRank = (it: Grammar) => ctx.levelOf(it.ko) ?? 99
  const passes = (it: Grammar): boolean => {
    if (filter.themeKos && !filter.themeKos.has(it.ko)) return false
    if (filter.level != null && ctx.levelOf(it.ko) !== filter.level) return false
    if (filter.category != null && ctx.categoryOf(it.ko) !== filter.category) return false
    return true
  }

  const rows = items.map((it, idx) => ({ it, idx })).filter((r) => passes(r.it))

  if (!q) {
    return rows.sort((a, b) => lvlRank(a.it) - lvlRank(b.it) || a.idx - b.idx).map((r) => r.it)
  }
  return rows
    .map((r) => ({ ...r, score: scoreItem(r.it, q, ctx.locale) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || lvlRank(a.it) - lvlRank(b.it) || a.idx - b.idx)
    .map((r) => r.it)
}
