import {
  allItems,
  itemById,
  itemsByImportance,
  itemsByLevel,
  itemsByTheme,
  searchByKo,
  spine,
  themesOfLevel,
  type GrammarItemWithSource,
  type Importance,
  type Theme,
  type TopikLevel,
} from '~/lib/domain'

/**
 * Composable that exposes the TOPIK curricular spine to components.
 *
 * The underlying data is static (loaded once from `seed/topik-spine.json`)
 * so the helpers are pure functions; no reactive state is created here.
 * Wrap calls in `computed(() => ...)` at the call site when you depend
 * on reactive inputs (e.g. a level selected by the user).
 */
export function useTopikSpine() {
  return {
    /** Raw typed spine (metadata, foundations, summaryByLevel…). */
    spine,

    /** Lookup by stable id. */
    itemById,

    /** Items in a TOPIK level (1–6), all themes flattened. */
    itemsByLevel: (level: TopikLevel): GrammarItemWithSource[] => itemsByLevel(level),

    /** Items at a given importance band, across all sources. */
    itemsByImportance: (importance: Importance): GrammarItemWithSource[] =>
      itemsByImportance(importance),

    /** Items inside a specific theme (TOPIK levels only). */
    itemsByTheme: (themeId: string): GrammarItemWithSource[] => itemsByTheme(themeId),

    /** Themes of a level in source order. */
    themesOfLevel: (level: TopikLevel): Theme[] => themesOfLevel(level),

    /** Substring search by Korean pattern. */
    searchByKo,

    /** Flat list of every grammar item across topik + transversal sections. */
    allItems,
  }
}
