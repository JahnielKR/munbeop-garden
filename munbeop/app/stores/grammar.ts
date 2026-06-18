import { defineStore } from 'pinia'
import type { Grammar, Deck } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'

export const useGrammarStore = defineStore('grammar', () => {
  const items = ref<Grammar[]>([])
  const decks = ref<Deck[]>([])
  // Plain array (not Set) — Set is not consistently serializable across SSR/CSR
  // payload boundaries and was causing devalue parse failures on hydration.
  const excludedDeckIds = ref<string[]>([])

  const activeIndices = computed(() =>
    items.value
      .map((g, idx) => ({ g, idx }))
      .filter(({ g }) => !excludedDeckIds.value.includes(g.deckId))
      .map(({ idx }) => idx),
  )

  function grammarByKo(ko: string): Grammar | undefined {
    return items.value.find((g) => g.ko === ko)
  }

  async function hydrate() {
    const storage = useStorageAdapter()
    items.value = await storage.read(STORAGE_KEYS.grammar, [] as Grammar[])
    decks.value = await storage.read(STORAGE_KEYS.decks, [] as Deck[])
    // The ~893 KB TOPIK seed is only a first-run fallback — for mandatory-account
    // users the catalog comes from Supabase, so it's dead weight on the eager
    // entry chunk. Load it on demand only when storage genuinely returns empty,
    // which Vite/Rollup then splits into a separate async chunk.
    if (items.value.length === 0 || decks.value.length === 0) {
      const { DEFAULT_GRAMMAR, TOPIK_DECKS } = await import('~/seed/grammars')
      if (items.value.length === 0) {
        items.value = [...DEFAULT_GRAMMAR]
        await storage.write(STORAGE_KEYS.grammar, items.value)
      }
      if (decks.value.length === 0) {
        decks.value = [...TOPIK_DECKS]
        await storage.write(STORAGE_KEYS.decks, decks.value)
      }
    }
  }

  function toggleDeck(deckId: string) {
    if (excludedDeckIds.value.includes(deckId)) {
      excludedDeckIds.value = excludedDeckIds.value.filter((id) => id !== deckId)
    } else {
      excludedDeckIds.value = [...excludedDeckIds.value, deckId]
    }
  }

  /**
   * Toggle a deck's `collapsed` flag and persist the change. Distinct from
   * {@link toggleDeck} — that one excludes the deck from practice; this one
   * just hides or shows its body in the Library UI.
   */
  async function toggleDeckCollapsed(deckId: string) {
    const idx = decks.value.findIndex((d) => d.id === deckId)
    if (idx === -1) return
    // Re-assign to a new array so reactivity fires reliably across adapters.
    decks.value = decks.value.map((d, i) =>
      i === idx ? { ...d, collapsed: !d.collapsed } : d,
    )
    const storage = useStorageAdapter()
    await storage.write(STORAGE_KEYS.decks, decks.value)
  }

  return {
    items,
    decks,
    excludedDeckIds,
    activeIndices,
    grammarByKo,
    hydrate,
    toggleDeck,
    toggleDeckCollapsed,
  }
})
