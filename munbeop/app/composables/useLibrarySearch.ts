import { watchDebounced } from '@vueuse/core'
import type { Grammar, GrammarType, LocaleCode, TopikLevel } from '~/lib/domain'
import { TOPIK_LEVELS, categoryOf, levelOf, itemsByTheme } from '~/lib/domain'
import { searchLibrary } from '~/lib/library/search'
import { useGrammarStore } from '~/stores/grammar'

/**
 * Single filter authority for the Library. Owns ?q= / ?level= / ?cat= and the
 * garden's ?theme= deep-link, exposes ranked `results` + `isFiltering`, and
 * writes changes back to the URL with `router.replace` (no history spam).
 * Replaces the old per-page zoneFilter logic.
 */
export function useLibrarySearch() {
  const route = useRoute()
  const router = useRouter()
  const { locale } = useI18n()
  const grammarStore = useGrammarStore()

  // Live, instant input value; ?q= mirrors it (debounced) for shareability.
  const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

  const level = computed<TopikLevel | null>(() => {
    const n = Number(route.query.level)
    return (TOPIK_LEVELS as readonly number[]).includes(n) ? (n as TopikLevel) : null
  })
  const category = computed<GrammarType | null>(() =>
    typeof route.query.cat === 'string' ? (route.query.cat as GrammarType) : null,
  )
  const themeKos = computed<Set<string> | null>(() => {
    const theme = typeof route.query.theme === 'string' ? route.query.theme : null
    if (!theme) return null
    const its = itemsByTheme(theme)
    return its.length ? new Set(its.map((i) => i.ko)) : null
  })
  const zoneLabel = computed<string | null>(() => {
    const theme = typeof route.query.theme === 'string' ? route.query.theme : null
    if (!theme) return null
    const src = itemsByTheme(theme)[0]?.source
    return src && src.kind === 'topik' ? src.themeTitle : theme
  })

  const isFiltering = computed(
    () => query.value.trim() !== '' || level.value !== null
       || category.value !== null || themeKos.value !== null,
  )

  const results = computed<Grammar[]>(() =>
    searchLibrary(
      grammarStore.items,
      { query: query.value, level: level.value, category: category.value, themeKos: themeKos.value },
      { locale: locale.value as LocaleCode, levelOf, categoryOf },
    ),
  )

  // Merge a patch into the current query (preserve ?grammar= etc.), dropping
  // any key whose value is undefined. Uses replace to avoid history spam.
  function mergeQuery(patch: Record<string, string | number | undefined>) {
    const next: Record<string, unknown> = { ...route.query, ...patch }
    for (const k of Object.keys(next)) if (next[k] === undefined) delete next[k]
    void router.replace({ query: next as never })
  }

  function setLevel(l: TopikLevel | null) { mergeQuery({ level: l ?? undefined }) }
  function setCategory(c: GrammarType | null) { mergeQuery({ cat: c ?? undefined }) }
  function clear() {
    query.value = ''
    mergeQuery({ q: undefined, level: undefined, cat: undefined, theme: undefined })
  }

  // Mirror the live input to ?q= without spamming history.
  watchDebounced(query, (q) => mergeQuery({ q: q.trim() || undefined }), { debounce: 200 })

  // Keep the input in sync when ?q= changes from outside (back button, deep link).
  watch(() => route.query.q, (q) => {
    const v = typeof q === 'string' ? q : ''
    if (v !== query.value) query.value = v
  })

  return { query, level, category, zoneLabel, isFiltering, results, setLevel, setCategory, clear }
}
