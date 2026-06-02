import { defineStore } from 'pinia'
import type { Grammar, Deck } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { DEFAULT_GRAMMAR, DEFAULT_DECK } from '~/seed/grammars'

const storage = new LocalStorageAdapter()

export const useGrammarStore = defineStore('grammar', () => {
  const items = ref<Grammar[]>([])
  const decks = ref<Deck[]>([])
  const excludedDeckIds = ref<Set<string>>(new Set())

  const activeIndices = computed(() =>
    items.value
      .map((g, idx) => ({ g, idx }))
      .filter(({ g }) => !excludedDeckIds.value.has(g.deckId))
      .map(({ idx }) => idx),
  )

  function grammarByKo(ko: string): Grammar | undefined {
    return items.value.find((g) => g.ko === ko)
  }

  function hydrate() {
    items.value = storage.read(STORAGE_KEYS.grammar, [] as Grammar[])
    decks.value = storage.read(STORAGE_KEYS.decks, [] as Deck[])
    if (items.value.length === 0) {
      items.value = [...DEFAULT_GRAMMAR]
      storage.write(STORAGE_KEYS.grammar, items.value)
    }
    if (decks.value.length === 0) {
      decks.value = [DEFAULT_DECK]
      storage.write(STORAGE_KEYS.decks, decks.value)
    }
  }

  function toggleDeck(deckId: string) {
    const newSet = new Set(excludedDeckIds.value)
    if (newSet.has(deckId)) newSet.delete(deckId)
    else newSet.add(deckId)
    excludedDeckIds.value = newSet
  }

  return { items, decks, excludedDeckIds, activeIndices, grammarByKo, hydrate, toggleDeck }
})
