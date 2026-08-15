import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCustomDecksStore } from '~/stores/customDecks'
import { useGrammarStore } from '~/stores/grammar'
import { STORAGE_KEYS } from '~/lib/storage'
import { useAuthStore } from '~/stores/auth'

let stored: Record<string, unknown> = {}
let failNextWrite = false
const { read, write } = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }))
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read,
    write,
  }),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  stored = {}
  failNextWrite = false
  read.mockReset()
  read.mockImplementation(async (key: string, fallback: unknown) => (key in stored ? stored[key] : fallback))
  write.mockClear()
  write.mockImplementation(async (key: string, value: unknown) => {
    if (failNextWrite) {
      failNextWrite = false
      throw new Error('cloud write failed')
    }
    stored[key] = value
  })
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

  it('serializes concurrent adds so both survive with distinct order', async () => {
    const s = useCustomDecksStore()
    let releaseFirst!: () => void
    write.mockImplementationOnce(
      () => new Promise<void>((resolve) => { releaseFirst = resolve }),
    )

    const first = s.addDeck({ name: 'a' })
    const second = s.addDeck({ name: 'b' })
    await Promise.resolve()
    await Promise.resolve()
    expect(write).toHaveBeenCalledTimes(1)

    releaseFirst()
    const [a, b] = await Promise.all([first, second])
    expect([a.order, b.order]).toEqual([0, 1])
    expect(s.decks.map((deck) => deck.name)).toEqual(['a', 'b'])
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

  it('rejects authenticated mutations after hydration fails without replacing cloud decks', async () => {
    useAuthStore().user = { id: 'u-1' } as never
    read.mockRejectedValueOnce(new Error('network down'))
    const s = useCustomDecksStore()

    await expect(s.hydrate()).rejects.toThrow('network down')
    await expect(s.addDeck({ name: 'unsafe' })).rejects.toThrow(
      'Custom decks are unavailable',
    )

    expect(write).not.toHaveBeenCalled()
    expect(s.decks).toEqual([])
  })

  it('queues hydrate with mutations so a stale read cannot erase a concurrent add', async () => {
    let resolveRead!: (value: unknown) => void
    read.mockImplementationOnce(() => new Promise((resolve) => { resolveRead = resolve }))
    const s = useCustomDecksStore()

    const hydration = s.hydrate()
    const addition = s.addDeck({ name: 'new' })
    await Promise.resolve()
    expect(write).not.toHaveBeenCalled()

    resolveRead([
      { id: 'cloud', name: 'cloud', colorId: 'gold', icon: 'deck-book', grammarKos: [], order: 0, createdAt: '2026-06-20T00:00:00.000Z' },
    ])
    await Promise.all([hydration, addition])

    expect(s.decks.map((deck) => deck.name)).toEqual(['cloud', 'new'])
    expect(write).toHaveBeenLastCalledWith(
      STORAGE_KEYS.customDecks,
      expect.arrayContaining([expect.objectContaining({ name: 'cloud' }), expect.objectContaining({ name: 'new' })]),
    )
  })

  it('sanitizes duplicate and ghost grammar ids against the hydrated catalog', async () => {
    useGrammarStore().items = [{
      ko: 'valid',
      meaning: { en: 'v', es: 'v', fr: 'v', 'pt-BR': 'v', th: 'v', id: 'v', vi: 'v', ja: 'v' },
      deckId: 'topik-1',
    }]
    stored[STORAGE_KEYS.customDecks] = [
      {
        id: 'x', name: 'seed', colorId: 'gold', icon: 'deck-book',
        grammarKos: ['valid', 'ghost', 'valid', 7], order: 0,
        createdAt: '2026-06-20T00:00:00.000Z',
      },
    ]
    const s = useCustomDecksStore()
    await s.hydrate()

    expect(s.deckById('x')!.grammarKos).toEqual(['valid'])
    // Hydration must stay read-only: writing a full sanitized snapshot could
    // prune a deck created concurrently in another tab.
    expect(write).not.toHaveBeenCalled()
  })

  // A rejected replace must roll back + rethrow so local state stays in sync
  // and the caller can offer a retry.
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
