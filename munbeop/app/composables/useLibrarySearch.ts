import { watchDebounced } from '@vueuse/core'
import type { Grammar, GrammarType, LocaleCode, TopikLevel } from '~/lib/domain'
import { TOPIK_LEVELS, categoryOf, levelOf, itemsByTheme } from '~/lib/domain'
import { searchLibrary } from '~/lib/library/search'
import {
  filterByMastery,
  isMasteryFilterValue,
  type MasteryFilterValue,
} from '~/lib/library/mastery-filter'
import { useGrammarStore } from '~/stores/grammar'
import { useSrsStore } from '~/stores/srs'
import { useLeeches } from '~/composables/useLeeches'

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
  const srs = useSrsStore()
  const { leechKos } = useLeeches()

  // Live, instant input value; ?q= mirrors it (debounced) for shareability.
  const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

  const level = computed<TopikLevel | null>(() => {
    const n = Number(route.query.level)
    return (TOPIK_LEVELS as readonly number[]).includes(n) ? (n as TopikLevel) : null
  })
  const category = computed<GrammarType | null>(() =>
    typeof route.query.cat === 'string' ? (route.query.cat as GrammarType) : null,
  )
  const mastery = computed<MasteryFilterValue | null>(() =>
    isMasteryFilterValue(route.query.mastery) ? route.query.mastery : null,
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
       || category.value !== null || themeKos.value !== null || mastery.value !== null,
  )

  const results = computed<Grammar[]>(() => {
    const ranked = searchLibrary(
      grammarStore.catalogItems,
      { query: query.value, level: level.value, category: category.value, themeKos: themeKos.value },
      { locale: locale.value as LocaleCode, levelOf, categoryOf },
    )
    // Mastery is per-ko SRS state, not part of the pure catalog search — apply it
    // as a post-filter so the "single filter authority" still owns the whole set.
    return filterByMastery(
      ranked,
      mastery.value,
      (ko) => srs.peek(ko).mastery,
      (ko) => leechKos.value.has(ko),
    )
  })

  // Merge a patch into the current query (preserve ?grammar= etc.), dropping
  // any key whose value is undefined. Uses replace to avoid history spam.
  function mergeQuery(patch: Record<string, string | number | undefined>) {
    const merged: Record<string, unknown> = { ...route.query, ...patch }
    const next: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined) next[k] = v
    }
    void router.replace({ query: next as never })
  }

  function setLevel(l: TopikLevel | null) { mergeQuery({ level: l ?? undefined }) }
  function setCategory(c: GrammarType | null) { mergeQuery({ cat: c ?? undefined }) }
  function setMastery(m: MasteryFilterValue | null) { mergeQuery({ mastery: m ?? undefined }) }
  function clear() {
    query.value = ''
    mergeQuery({ q: undefined, level: undefined, cat: undefined, theme: undefined, mastery: undefined })
  }

  // Mirror the live input to ?q= without spamming history.
  watchDebounced(query, (q) => mergeQuery({ q: q.trim() || undefined }), { debounce: 200 })

  // Keep the input in sync when ?q= changes from outside (back button, deep link).
  watch(() => route.query.q, (q) => {
    const v = typeof q === 'string' ? q : ''
    if (v !== query.value) query.value = v
  })

  return {
    query, level, category, mastery, zoneLabel, isFiltering, results,
    setLevel, setCategory, setMastery, clear,
  }
}
