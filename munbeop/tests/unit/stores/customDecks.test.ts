import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCustomDecksStore } from '~/stores/customDecks'
import { STORAGE_KEYS } from '~/lib/storage'

let stored: Record<string, unknown> = {}
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: async (key: string, fallback: unknown) => (key in stored ? stored[key] : fallback),
    write: async (key: string, value: unknown) => { stored[key] = value },
  }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  stored = {}
})

describe('useCustomDecksStore', () => {
  it('addDeck creates a deck with id/order/createdAt and persists it', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: '  My deck  ', colorId: 'rose', icon: 'deck-flame', grammarKos: ['-아서'] })
    expect(d.id).toBeTruthy()
    expect(d.name).toBe('My deck')        // trimmed
    expect(d.order).toBe(0)
    expect(d.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(s.decks).toHaveLength(1)
    expect((stored[STORAGE_KEYS.customDecks] as unknown[])).toHaveLength(1)
  })

  it('addDeck applies defaults when color/icon omitted', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: 'x' })
    expect(d.colorId).toBe('sky')
    expect(d.icon).toBe('deck-star')
    expect(d.grammarKos).toEqual([])
  })

  it('order increments per deck', async () => {
    const s = useCustomDecksStore()
    await s.addDeck({ name: 'a' })
    const b = await s.addDeck({ name: 'b' })
    expect(b.order).toBe(1)
  })

  it('updateDeck patches fields and trims the name', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: 'a' })
    await s.updateDeck(d.id, { name: '  renamed ', grammarKos: ['-니까', '-는데'] })
    const got = s.deckById(d.id)!
    expect(got.name).toBe('renamed')
    expect(got.grammarKos).toEqual(['-니까', '-는데'])
    expect(got.order).toBe(d.order) // order/createdAt untouched
  })

  it('removeDeck deletes and persists', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: 'a' })
    await s.removeDeck(d.id)
    expect(s.decks).toHaveLength(0)
    expect(stored[STORAGE_KEYS.customDecks]).toEqual([])
  })

  it('hydrate reads the persisted list', async () => {
    stored[STORAGE_KEYS.customDecks] = [
      { id: 'x', name: 'seed', colorId: 'gold', icon: 'deck-book', grammarKos: [], order: 0, createdAt: '2026-06-20T00:00:00.000Z' },
    ]
    const s = useCustomDecksStore()
    await s.hydrate()
    expect(s.deckById('x')!.name).toBe('seed')
  })
})
