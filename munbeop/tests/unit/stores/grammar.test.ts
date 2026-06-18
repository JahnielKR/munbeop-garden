import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGrammarStore } from '~/stores/grammar'
import { STORAGE_KEYS } from '~/lib/storage'
import type { Grammar, Deck } from '~/lib/domain'

// Controllable fake storage so we can exercise both the empty-fallback path
// (seed DEFAULT_GRAMMAR / TOPIK_DECKS) and the has-data path (don't overwrite).
let stored: Record<string, unknown> = {}
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: async (key: string, fallback: unknown) => (key in stored ? stored[key] : fallback),
    write: async (key: string, value: unknown) => {
      stored[key] = value
    },
    remove: async () => {},
    clear: async () => {},
  }),
}))

describe('useGrammarStore.hydrate', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stored = {}
  })

  it('seeds the catalog and the six TOPIK decks when storage is empty', async () => {
    const store = useGrammarStore()
    await store.hydrate()
    expect(store.items.length).toBeGreaterThan(0)
    expect(store.decks.map((d) => d.id)).toEqual([
      'topik-1',
      'topik-2',
      'topik-3',
      'topik-4',
      'topik-5',
      'topik-6',
    ])
    // The seeded defaults are written back so the next read is non-empty.
    expect((stored[STORAGE_KEYS.grammar] as Grammar[]).length).toBeGreaterThan(0)
  })

  it('uses stored data as-is and does not overwrite it with the seed', async () => {
    const grammar: Grammar = {
      ko: 'test-ko',
      meaning: { en: 'x', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
      deckId: 'topik-1',
    }
    const deck: Deck = { id: 'mine', name: 'Mine', colorId: 'indigo', order: 0, collapsed: false }
    stored = { [STORAGE_KEYS.grammar]: [grammar], [STORAGE_KEYS.decks]: [deck] }

    const store = useGrammarStore()
    await store.hydrate()
    expect(store.items).toHaveLength(1)
    expect(store.items[0]!.ko).toBe('test-ko')
    expect(store.decks).toHaveLength(1)
    expect(store.decks[0]!.id).toBe('mine')
  })
})
