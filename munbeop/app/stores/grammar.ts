import { defineStore } from 'pinia'
import type { Grammar, Deck } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { DEFAULT_GRAMMAR, DEFAULT_DECK } from '~/seed/grammars'

const storage = new LocalStorageAdapter()

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
    items.value = await storage.read(STORAGE_KEYS.grammar, [] as Grammar[])
    decks.value = await storage.read(STORAGE_KEYS.decks, [] as Deck[])
    if (items.value.length === 0) {
      items.value = [...DEFAULT_GRAMMAR]
      await storage.write(STORAGE_KEYS.grammar, items.value)
    }
    if (decks.value.length === 0) {
      decks.value = [DEFAULT_DECK]
      await storage.write(STORAGE_KEYS.decks, decks.value)
    }
  }

  function toggleDeck(deckId: string) {
    if (excludedDeckIds.value.includes(deckId)) {
      excludedDeckIds.value = excludedDeckIds.value.filter((id) => id !== deckId)
    } else {
      excludedDeckIds.value = [...excludedDeckIds.value, deckId]
    }
  }

  return { items, decks, excludedDeckIds, activeIndices, grammarByKo, hydrate, toggleDeck }
})
