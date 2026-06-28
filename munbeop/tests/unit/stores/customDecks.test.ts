import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCustomDecksStore } from '~/stores/customDecks'
import { STORAGE_KEYS } from '~/lib/storage'

let stored: Record<string, unknown> = {}
let failNextWrite = false
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: async (key: string, fallback: unknown) => (key in stored ? stored[key] : fallback),
    write: async (key: string, value: unknown) => {
      if (failNextWrite) {
        failNextWrite = false
        throw new Error('cloud write failed')
      }
      stored[key] = value
    },
  }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  stored = {}
  failNextWrite = false
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

  // The Supabase write is delete-then-upsert, so a mid-write failure could wipe
  // every deck in the cloud. The store must roll back + rethrow so local state
  // stays in sync and the caller can offer a retry.
  it('addDeck rolls back and rethrows when the cloud write fails', async () => {
    const s = useCustomDecksStore()
    failNextWrite = true
    await expect(s.addDeck({ name: 'x' })).rejects.toThrow()
    expect(s.decks).toHaveLength(0)
  })

  it('updateDeck restores the previous deck when the cloud write fails', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: 'a' })
    failNextWrite = true
    await expect(s.updateDeck(d.id, { name: 'renamed' })).rejects.toThrow()
    expect(s.deckById(d.id)!.name).toBe('a')
  })

  it('removeDeck restores the deck when the cloud write fails', async () => {
    const s = useCustomDecksStore()
    const d = await s.addDeck({ name: 'a' })
    failNextWrite = true
    await expect(s.removeDeck(d.id)).rejects.toThrow()
    expect(s.deckById(d.id)).toBeDefined()
    expect(s.decks).toHaveLength(1)
  })
})
