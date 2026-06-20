import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGrammarStore } from '~/stores/grammar'
import { CUSTOM_DECK_ID, type LocalizedString } from '~/lib/domain'

// vi.mock is hoisted above the imports by Vitest, so the store picks it up.
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: vi.fn().mockResolvedValue([]), write: vi.fn().mockResolvedValue(undefined) }),
}))

const L = (s: string): LocalizedString => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })

describe('grammar store custom grammars', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('addCustomGrammar adds a custom-deck item exposed via customGrammars', async () => {
    const store = useGrammarStore()
    const g = await store.addCustomGrammar({ ko: '-거든요', meaning: L('giving a reason'), example: '바빠서 못 갔거든요' })
    expect(g).not.toBeNull()
    expect(g!.deckId).toBe(CUSTOM_DECK_ID)
    expect(g!.example).toBe('바빠서 못 갔거든요')
    expect(store.customGrammars).toHaveLength(1)
    expect(store.items.some((x) => x.ko === '-거든요')).toBe(true)
  })

  it('rejects a non-Hangul ko and a duplicate (no item added)', async () => {
    const store = useGrammarStore()
    expect(await store.addCustomGrammar({ ko: 'abc', meaning: L('x') })).toBeNull()
    await store.addCustomGrammar({ ko: '-거든요', meaning: L('x') })
    expect(await store.addCustomGrammar({ ko: '-거든요', meaning: L('dup') })).toBeNull()
    expect(store.customGrammars).toHaveLength(1)
  })

  it('removeCustomGrammar removes the matching custom item', async () => {
    const store = useGrammarStore()
    await store.addCustomGrammar({ ko: '-거든요', meaning: L('x') })
    expect(await store.removeCustomGrammar('-거든요')).toBe(true)
    expect(store.customGrammars).toHaveLength(0)
  })
})
