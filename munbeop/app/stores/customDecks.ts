import { defineStore } from 'pinia'
import type { CustomDeck } from '~/lib/domain'
import { DEFAULT_DECK_COLOR_ID, DEFAULT_DECK_ICON } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'

export interface NewCustomDeck {
  name: string
  colorId?: string
  icon?: string
  grammarKos?: string[]
  imageUrl?: string
}

export type CustomDeckPatch = Partial<Omit<CustomDeck, 'id' | 'order' | 'createdAt'>>

export const useCustomDecksStore = defineStore('customDecks', () => {
  const decks = ref<CustomDeck[]>([])

  /** Decks in display order (creation order). */
  const sorted = computed(() => [...decks.value].sort((a, b) => a.order - b.order))

  function deckById(id: string): CustomDeck | undefined {
    return decks.value.find((d) => d.id === id)
  }

  async function hydrate() {
    const storage = useStorageAdapter()
    decks.value = await storage.read(STORAGE_KEYS.customDecks, [] as CustomDeck[])
  }

  async function persist() {
    const storage = useStorageAdapter()
    await storage.write(STORAGE_KEYS.customDecks, decks.value)
  }

  // The Supabase write is delete-then-upsert ('replace the user's set'): a
  // network drop between the two halves leaves the cloud EMPTY while local state
  // still looks fine — every deck silently gone on the next hydrate. Snapshot +
  // rollback + rethrow (same discipline as the contexts store) keeps local in
  // sync and lets the caller surface a retry instead of losing the decks.
  async function addDeck(input: NewCustomDeck): Promise<CustomDeck> {
    const deck: CustomDeck = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      colorId: input.colorId ?? DEFAULT_DECK_COLOR_ID,
      icon: input.icon ?? DEFAULT_DECK_ICON,
      grammarKos: [...(input.grammarKos ?? [])],
      order: decks.value.length,
      createdAt: new Date().toISOString(),
      ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    }
    const snapshot = decks.value
    decks.value = [...decks.value, deck]
    try {
      await persist()
    } catch (e) {
      decks.value = snapshot
      throw e
    }
    return deck
  }

  async function updateDeck(id: string, patch: CustomDeckPatch): Promise<void> {
    const idx = decks.value.findIndex((d) => d.id === id)
    if (idx === -1) return
    const next: CustomDeck = { ...decks.value[idx]!, ...patch }
    if (patch.name !== undefined) next.name = patch.name.trim()
    if (patch.grammarKos !== undefined) next.grammarKos = [...patch.grammarKos]
    const snapshot = decks.value
    decks.value = decks.value.map((d, i) => (i === idx ? next : d))
    try {
      await persist()
    } catch (e) {
      decks.value = snapshot
      throw e
    }
  }

  async function removeDeck(id: string): Promise<void> {
    if (!decks.value.some((d) => d.id === id)) return
    const snapshot = decks.value
    decks.value = decks.value.filter((d) => d.id !== id)
    try {
      await persist()
    } catch (e) {
      decks.value = snapshot
      throw e
    }
  }

  return { decks, sorted, deckById, hydrate, addDeck, updateDeck, removeDeck }
})
