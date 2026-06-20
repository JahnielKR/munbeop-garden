import { defineStore } from 'pinia'
import type { Grammar, Deck, LocalizedString } from '~/lib/domain'
import { CUSTOM_DECK_ID, isHangulName } from '~/lib/domain'
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

  const customGrammars = computed(() =>
    items.value.filter((g) => g.deckId === CUSTOM_DECK_ID),
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

  /**
   * Add a user-authored grammar. The single meaning text is expected pre-built
   * into all 8 locale slots by the caller (see CustomGrammarAddForm). Returns
   * the new Grammar, or null when the ko is not Korean or already exists.
   */
  async function addCustomGrammar(p: {
    ko: string
    meaning: LocalizedString
    example?: string
  }): Promise<Grammar | null> {
    const ko = p.ko.trim()
    if (!isHangulName(ko)) return null
    if (items.value.some((g) => g.ko === ko)) return null
    const example = p.example?.trim()
    const grammar: Grammar = {
      ko,
      meaning: p.meaning,
      deckId: CUSTOM_DECK_ID,
      ...(example ? { example } : {}),
    }
    items.value = [...items.value, grammar]
    const storage = useStorageAdapter()
    await storage.write(STORAGE_KEYS.grammar, items.value)
    return grammar
  }

  /** Remove a user-authored grammar by ko. Returns false if not a custom item. */
  async function removeCustomGrammar(ko: string): Promise<boolean> {
    const target = items.value.find((g) => g.ko === ko && g.deckId === CUSTOM_DECK_ID)
    if (!target) return false
    items.value = items.value.filter((g) => g !== target)
    const storage = useStorageAdapter()
    await storage.write(STORAGE_KEYS.grammar, items.value)
    return true
  }

  return {
    items,
    decks,
    excludedDeckIds,
    activeIndices,
    customGrammars,
    grammarByKo,
    hydrate,
    toggleDeck,
    toggleDeckCollapsed,
    addCustomGrammar,
    removeCustomGrammar,
  }
})
