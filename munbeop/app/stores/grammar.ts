import { defineStore } from 'pinia'
import type { Grammar, Deck } from '~/lib/domain'
import { LocalStorageAdapter, STORAGE_KEYS } from '~/lib/storage'
import { DEFAULT_GRAMMAR, DEFAULT_DECK } from '~/seed/grammars'

interface GrammarState {
  items: Grammar[]
  decks: Deck[]
  excludedDeckIds: Set<string>
}

const storage = new LocalStorageAdapter()

export const useGrammarStore = defineStore('grammar', {
  state: (): GrammarState => ({
    items: [],
    decks: [],
    excludedDeckIds: new Set(),
  }),
  getters: {
    activeIndices: (state) =>
      state.items
        .map((g, idx) => ({ g, idx }))
        .filter(({ g }) => !state.excludedDeckIds.has(g.deckId))
        .map(({ idx }) => idx),
    grammarByKo: (state) => (ko: string) => state.items.find((g) => g.ko === ko),
  },
  actions: {
    hydrate() {
      this.items = storage.read(STORAGE_KEYS.grammar, [] as Grammar[])
      this.decks = storage.read(STORAGE_KEYS.decks, [] as Deck[])
      if (this.items.length === 0) {
        this.items = [...DEFAULT_GRAMMAR]
        storage.write(STORAGE_KEYS.grammar, this.items)
      }
      if (this.decks.length === 0) {
        this.decks = [DEFAULT_DECK]
        storage.write(STORAGE_KEYS.decks, this.decks)
      }
    },
    toggleDeck(deckId: string) {
      if (this.excludedDeckIds.has(deckId)) {
        this.excludedDeckIds.delete(deckId)
      } else {
        this.excludedDeckIds.add(deckId)
      }
    },
  },
})
