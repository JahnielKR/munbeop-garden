import { defineStore } from 'pinia'
import type { CustomDeck } from '~/lib/domain'
import { DEFAULT_DECK_COLOR_ID, DEFAULT_DECK_ICON } from '~/lib/domain'
import { STORAGE_KEYS } from '~/lib/storage'
import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useGrammarStore } from '~/stores/grammar'
import { useAuthStore } from '~/stores/auth'

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
  const grammarStore = useGrammarStore()
  let mutationTail: Promise<void> = Promise.resolve()
  let hydratedUserId: string | null = null

  /** Serialize full-set writes. Without this queue, two callers can each take
   * a stale snapshot and the slower write/rollback can erase the faster one. */
  function enqueueMutation<T>(run: () => Promise<T>): Promise<T> {
    const job = mutationTail.then(run)
    mutationTail = job.then(() => undefined, () => undefined)
    return job
  }

  /** Decks in display order (creation order). */
  const sorted = computed(() => [...decks.value].sort((a, b) => a.order - b.order))

  function deckById(id: string): CustomDeck | undefined {
    return decks.value.find((d) => d.id === id)
  }

  /** Remove duplicates, malformed values, and references that are absent from
   * the hydrated grammar catalog. When the catalog is intentionally empty,
   * retain well-formed strings until it is available. */
  function sanitizeGrammarKos(raw: unknown): string[] {
    const validKos = new Set(grammarStore.items.map((grammar) => grammar.ko))
    const canValidateCatalog = validKos.size > 0
    const unique = new Set<string>()
    if (!Array.isArray(raw)) return []
    for (const ko of raw) {
      if (typeof ko !== 'string' || unique.has(ko)) continue
      if (canValidateCatalog && !validKos.has(ko)) continue
      unique.add(ko)
    }
    return [...unique]
  }

  function hydrate(): Promise<void> {
    // The read itself belongs in the same queue as writes. Merely awaiting the
    // old tail before starting a read left a TOCTOU window: a newly-enqueued add
    // could save, then a slower stale read would overwrite it in memory.
    return enqueueMutation(async () => {
      const userId = useAuthStore().user?.id ?? null
      const storage = useStorageAdapter()
      const raw = await storage.read(STORAGE_KEYS.customDecks, [] as CustomDeck[])
      if ((useAuthStore().user?.id ?? null) !== userId) return
      const next = raw.map((deck) => ({
        ...deck,
        grammarKos: sanitizeGrammarKos((deck as { grammarKos?: unknown }).grammarKos),
      }))
      decks.value = next
      hydratedUserId = userId
      // Sanitize in memory only. Writing this read snapshot back as a full set
      // would prune a deck another tab created between our read and write.
    })
  }

  function assertSafeToMutate(): void {
    const userId = useAuthStore().user?.id
    if (userId && hydratedUserId !== userId) {
      throw new Error('Custom decks are unavailable until account data loads')
    }
  }

  // Snapshot + rollback + rethrow keeps local state aligned with the cloud and
  // lets the caller surface a retry instead of silently losing a deck edit.
  function addDeck(input: NewCustomDeck): Promise<CustomDeck> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      const deck: CustomDeck = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        colorId: input.colorId ?? DEFAULT_DECK_COLOR_ID,
        icon: input.icon ?? DEFAULT_DECK_ICON,
        grammarKos: sanitizeGrammarKos(input.grammarKos ?? []),
        order: decks.value.length,
        createdAt: new Date().toISOString(),
        ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
      }
      const snapshot = decks.value
      decks.value = [...decks.value, deck]
      try {
        const storage = useStorageAdapter()
        await storage.upsertOne(STORAGE_KEYS.customDecks, { id: deck.id, value: deck })
      } catch (e) {
        decks.value = snapshot
        throw e
      }
      return deck
    })
  }

  function updateDeck(id: string, patch: CustomDeckPatch): Promise<void> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      const idx = decks.value.findIndex((d) => d.id === id)
      if (idx === -1) return
      const next: CustomDeck = { ...decks.value[idx]!, ...patch }
      if (patch.name !== undefined) next.name = patch.name.trim()
      if (patch.grammarKos !== undefined) next.grammarKos = sanitizeGrammarKos(patch.grammarKos)
      const snapshot = decks.value
      decks.value = decks.value.map((d, i) => (i === idx ? next : d))
      try {
        const storage = useStorageAdapter()
        await storage.upsertOne(STORAGE_KEYS.customDecks, { id, value: next })
      } catch (e) {
        decks.value = snapshot
        throw e
      }
    })
  }

  function removeDeck(id: string): Promise<void> {
    return enqueueMutation(async () => {
      assertSafeToMutate()
      if (!decks.value.some((d) => d.id === id)) return
      const snapshot = decks.value
      decks.value = decks.value.filter((d) => d.id !== id)
      try {
        const storage = useStorageAdapter()
        await storage.deleteOne(STORAGE_KEYS.customDecks, id)
      } catch (e) {
        decks.value = snapshot
        throw e
      }
    })
  }

  return { decks, sorted, deckById, hydrate, addDeck, updateDeck, removeDeck }
})
