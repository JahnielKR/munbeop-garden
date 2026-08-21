import { defineStore } from 'pinia'
import type { Grammar, Deck, LocalizedString } from '~/lib/domain'
import { CUSTOM_DECK_ID, dedupeGrammarByKo, isHangulName } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'

export const useGrammarStore = defineStore('grammar', () => {
  const items = ref<Grammar[]>([])
  const decks = ref<Deck[]>([])
  const settings = useSettingsStore()
  const authStore = useAuthStore()
  let mutationTail: Promise<void> = Promise.resolve()
  let hydratedUserId: string | null = null

  function enqueueMutation<T>(run: () => Promise<T>): Promise<T> {
    const job = mutationTail.then(run)
    mutationTail = job.then(() => undefined, () => undefined)
    return job
  }

  function assertSafeToMutate(): void {
    const userId = authStore.user?.id
    if (userId && hydratedUserId !== userId) {
      throw new Error('Grammar data is unavailable until account data loads')
    }
  }

  const excludedDeckIds = computed(() => settings.excludedDeckIds)
  const activeIndices = computed(() =>
    items.value
      .map((grammar, idx) => ({ grammar, idx }))
      .filter(({ grammar }) => !excludedDeckIds.value.includes(grammar.deckId))
      .map(({ idx }) => idx),
  )
  const customGrammars = computed(() =>
    items.value.filter((grammar) => grammar.deckId === CUSTOM_DECK_ID),
  )
  const catalogItems = computed(() =>
    items.value.filter((grammar) => grammar.deckId !== CUSTOM_DECK_ID),
  )

  function grammarByKo(ko: string): Grammar | undefined {
    return items.value.find((grammar) => grammar.ko === ko)
  }

  function hydrate(): Promise<void> {
    return enqueueMutation(async () => {
      const userId = authStore.user?.id ?? null
      const storage = useStorageAdapter()
      let nextItems = dedupeGrammarByKo(
        await storage.read(STORAGE_KEYS.grammar, [] as Grammar[]),
      )
      let nextDecks = await storage.read(STORAGE_KEYS.decks, [] as Deck[])
      if ((authStore.user?.id ?? null) !== userId) return

      // The large TOPIK seed is a first-run fallback and remains code-split.
      if (nextItems.length === 0 || nextDecks.length === 0) {
        const { DEFAULT_GRAMMAR, TOPIK_DECKS } = await import('~/seed/grammars')
        if (nextItems.length === 0) {
          nextItems = [...DEFAULT_GRAMMAR]
          await storage.write(STORAGE_KEYS.grammar, nextItems)
        }
        if (nextDecks.length === 0) {
          nextDecks = [...TOPIK_DECKS]
          await storage.write(STORAGE_KEYS.decks, nextDecks)
        }
      }
      if ((authStore.user?.id ?? null) !== userId) return
      items.value = nextItems
      decks.value = nextDecks
      hydratedUserId = userId
    })
  }

  function toggleDeck(deckId: string): Promise<boolean> {
    return settings.toggleDeck(deckId)
  }

  function toggleDeckCollapsed(deckId: string): Promise<void> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      const idx = decks.value.findIndex((deck) => deck.id === deckId)
      if (idx === -1) return
      const snapshot = decks.value
      decks.value = decks.value.map((deck, index) =>
        index === idx ? { ...deck, collapsed: !deck.collapsed } : deck,
      )
      try {
        const storage = useStorageAdapter()
        await storage.upsertOne(STORAGE_KEYS.decks, {
          id: deckId,
          value: decks.value[idx]!,
        })
      } catch (error) {
        decks.value = snapshot
        throw error
      }
    })
  }

  function addCustomGrammar(input: {
    ko: string
    meaning: LocalizedString
    example?: string
  }): Promise<Grammar | null> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      const ko = input.ko.trim()
      if (!isHangulName(ko) || items.value.some((grammar) => grammar.ko === ko)) return null
      const example = input.example?.trim()
      const grammar: Grammar = {
        ko,
        meaning: input.meaning,
        deckId: CUSTOM_DECK_ID,
        ...(example ? { example } : {}),
      }
      const snapshot = items.value
      items.value = [...items.value, grammar]
      try {
        const storage = useStorageAdapter()
        await storage.upsertOne(STORAGE_KEYS.grammar, { id: grammar.ko, value: grammar })
      } catch (error) {
        items.value = snapshot
        throw error
      }
      return grammar
    })
  }

  function removeCustomGrammar(ko: string): Promise<boolean> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      const target = items.value.find(
        (grammar) => grammar.ko === ko && grammar.deckId === CUSTOM_DECK_ID,
      )
      if (!target) return false
      const snapshot = items.value
      items.value = items.value.filter((grammar) => grammar !== target)
      try {
        const storage = useStorageAdapter()
        await storage.deleteOne(STORAGE_KEYS.grammar, ko)
      } catch (error) {
        items.value = snapshot
        throw error
      }
      return true
    })
  }

  return {
    items,
    decks,
    excludedDeckIds,
    activeIndices,
    customGrammars,
    catalogItems,
    grammarByKo,
    hydrate,
    toggleDeck,
    toggleDeckCollapsed,
    addCustomGrammar,
    removeCustomGrammar,
  }
})
