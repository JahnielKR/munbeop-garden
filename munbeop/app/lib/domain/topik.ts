import spineJson from '~/seed/topik-spine.json'

/**
 * TOPIK curricular spine — types and pure lookups over the categorized
 * grammar database in `seed/topik-spine.json`.
 *
 * The JSON is the single source of truth for level/theme/importance metadata.
 * Runtime grammar content (translations, decks, examples) lives in
 * `seed/grammars.ts` and is keyed by `ko`. Cross-reference via `ko`.
 */

// ─── Enums ──────────────────────────────────────────────────────────────────

export const TOPIK_LEVELS = [1, 2, 3, 4, 5, 6] as const
export type TopikLevel = (typeof TOPIK_LEVELS)[number]

export const IMPORTANCE_VALUES = ['critical', 'frequent', 'nuance'] as const
export type Importance = (typeof IMPORTANCE_VALUES)[number]

export type Stars = '★★★' | '★★' | '★'

/** Coarse-grained syntactic/semantic category of an entry. */
export type GrammarType =
  | 'particle'
  | 'ending'
  | 'conj'
  | 'expr'
  | 'aux'
  | 'verb'
  | 'voice'
  | 'lex'
  | 'nominal'
  | 'modifier'
  | 'copula'
  | 'negation'
  | 'adv'
  | 'indirect'
  | 'meta'

// ─── Item shapes ────────────────────────────────────────────────────────────

export interface GrammarItem {
  /** Stable id, e.g. "G002", "D007", "I001", "M003", "SL003". */
  id: string
  /** Korean pattern as it appears in the source database. */
  ko: string
  /** Coarse category — optional because cultural items don't always carry one. */
  type?: GrammarType
  /** Short English keyword for the semantic function (topic, future-conjecture…). */
  fn?: string
  /** Importance star band. */
  stars: Stars
  /** One-line Spanish summary. */
  es: string
}

export interface Theme {
  id: string
  title: string
  importance: Importance
  items: GrammarItem[]
}

export interface TopikLevelData {
  name: string
  exam: 'TOPIK I' | 'TOPIK II'
  objective: string
  structuresBase: number
  structuresSuppl: number
  themes: Theme[]
}

// ─── Source annotation for the flattened view ──────────────────────────────

export type GrammarSource =
  | { kind: 'topik'; level: TopikLevel; themeId: string; themeTitle: string; importance: Importance }
  | { kind: 'auxiliaries' }
  | { kind: 'indirectSpeech' }
  | { kind: 'additional' }
  | { kind: 'complementary' }

export interface GrammarItemWithSource extends GrammarItem {
  source: GrammarSource
}

// ─── Raw spine (typed) ──────────────────────────────────────────────────────

/**
 * Full typed view of the spine JSON. Treated as `readonly` at runtime;
 * mutations are not supported (the file is generated, not edited).
 */
export interface TopikSpine {
  $schema: string
  version: string
  generatedAt: string
  source: { name: string; files: number; totalStructures: number; coverageNote: string }
  importanceLegend: Record<Importance, { stars: Stars; desc: string }>
  readingOrder: string[]
  foundations: {
    speechLevels: { file: string; importance: Importance; introduceBefore: string; summary: string; registers: Array<{ id: string; code: string; use: string; endings?: Record<string, string>; rule?: string }>; honorificVocab: { verbs: Array<{ normal: string; honorific: string }>; nouns: Array<{ normal: string; honorific: string }>; particles: Array<{ normal: string; honorific: string }> } }
    irregulars: { file: string; importance: Importance; introduceBefore: string; summary: string; types: Array<{ id: string; name: string; rule: string; examples?: string[]; verbs: string[]; regularExceptions?: string[] }> }
    nominalModifiers: { file: string; importance: Importance; introduceBefore: string; summary: string; forms: Array<{ id: string; pattern: string; tense: string; use: string; example?: string }>; functionalNouns: Array<{ noun: string; use: string }> }
  }
  topik: Record<`${TopikLevel}`, TopikLevelData>
  auxiliaries: { file: string; importance: Importance; introducedAcross: string[]; summary: string; items: GrammarItem[] }
  indirectSpeech: { file: string; importance: Importance; introducedAt: string; summary: string; baseForms: Array<{ type: string; form: string; tenses?: Record<string, string>; rule?: string }>; contractions: { present: Array<{ from: string; to: string }>; past: Array<{ from: string; to: string }> }; items: GrammarItem[] }
  additionalGrammar: { file: string; importance: Importance; introducedAcross: string[]; summary: string; items: GrammarItem[] }
  complementaryGrammar: { file: string; importance: Importance; introducedAcross: string[]; summary: string; items: GrammarItem[] }
  cultural: Record<string, { file: string; title: string; importance: Importance; topikLevels: number[] | (number | string)[]; [k: string]: unknown }>
  summaryByLevel: Record<string, { structuresBase?: number; structuresSuppl?: number; total: number; themes?: number; exam?: string } | Record<string, number>>
}

/** Typed spine instance loaded from the seed JSON. */
export const spine: TopikSpine = spineJson as unknown as TopikSpine

// ─── Pure lookups ──────────────────────────────────────────────────────────

/**
 * Iterate every grammar item across the spine with its provenance.
 * Includes TOPIK levels 1–6 + the four transversal sections.
 * Does NOT include foundations (speech levels / irregulars / modifiers) —
 * those have a different shape; query `spine.foundations` directly.
 */
export function allItems(): GrammarItemWithSource[] {
  const out: GrammarItemWithSource[] = []
  for (const lvl of TOPIK_LEVELS) {
    const data = spine.topik[`${lvl}`]
    for (const theme of data.themes) {
      for (const item of theme.items) {
        out.push({
          ...item,
          source: {
            kind: 'topik',
            level: lvl,
            themeId: theme.id,
            themeTitle: theme.title,
            importance: theme.importance,
          },
        })
      }
    }
  }
  for (const item of spine.auxiliaries.items) {
    out.push({ ...item, source: { kind: 'auxiliaries' } })
  }
  for (const item of spine.indirectSpeech.items) {
    out.push({ ...item, source: { kind: 'indirectSpeech' } })
  }
  for (const item of spine.additionalGrammar.items) {
    out.push({ ...item, source: { kind: 'additional' } })
  }
  for (const item of spine.complementaryGrammar.items) {
    out.push({ ...item, source: { kind: 'complementary' } })
  }
  return out
}

/** Find an item by stable id (G002, D007, etc). O(n) — acceptable for ~290 items. */
export function itemById(id: string): GrammarItemWithSource | undefined {
  return allItems().find((x) => x.id === id)
}

/** All items belonging to a TOPIK level (themes flattened). */
export function itemsByLevel(level: TopikLevel): GrammarItemWithSource[] {
  return allItems().filter((x) => x.source.kind === 'topik' && x.source.level === level)
}

/**
 * All items at a given importance band.
 * Transversal sections inherit the section-level importance.
 */
export function itemsByImportance(importance: Importance): GrammarItemWithSource[] {
  return allItems().filter((x) => {
    if (x.source.kind === 'topik') return x.source.importance === importance
    if (x.source.kind === 'auxiliaries') return spine.auxiliaries.importance === importance
    if (x.source.kind === 'indirectSpeech') return spine.indirectSpeech.importance === importance
    if (x.source.kind === 'additional') return spine.additionalGrammar.importance === importance
    if (x.source.kind === 'complementary') return spine.complementaryGrammar.importance === importance
    return false
  })
}

/** All items inside a specific theme (only TOPIK levels have themes). */
export function itemsByTheme(themeId: string): GrammarItemWithSource[] {
  return allItems().filter((x) => x.source.kind === 'topik' && x.source.themeId === themeId)
}

/** Themes belonging to a TOPIK level, in source order. */
export function themesOfLevel(level: TopikLevel): Theme[] {
  return spine.topik[`${level}`].themes
}

/**
 * Substring search by `ko` pattern. Case-insensitive on Latin letters,
 * exact on hangul. Returns items in `allItems()` order.
 */
export function searchByKo(query: string): GrammarItemWithSource[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return allItems().filter((x) => x.ko.toLowerCase().includes(q))
}

/** Map of stars symbol → importance band, for sorting/UI badges. */
export const STARS_TO_IMPORTANCE: Record<Stars, Importance> = {
  '★★★': 'critical',
  '★★': 'frequent',
  '★': 'nuance',
}
