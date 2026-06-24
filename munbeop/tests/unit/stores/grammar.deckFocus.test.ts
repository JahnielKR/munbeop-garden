import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGrammarStore } from '~/stores/grammar'
import { useSettingsStore } from '~/stores/settings'
import type { Grammar } from '~/lib/domain'

// excludedDeckIds is persisted by the settings store; the grammar store
// re-exposes it (read-only) + delegates toggleDeck. No real adapter needed.
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: async (_k: string, fallback: unknown) => fallback,
    write: async () => {},
    remove: async () => {},
    clear: async () => {},
  }),
}))

const g = (deckId: string): Grammar => ({ ko: deckId + '-x', deckId, meaning: {} as never })

describe('grammar store deck-focus delegation', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('excludedDeckIds mirrors the settings store', async () => {
    const grammar = useGrammarStore()
    const settings = useSettingsStore()
    expect(grammar.excludedDeckIds).toEqual([])
    await settings.toggleDeck('topik-2')
    expect(grammar.excludedDeckIds).toEqual(['topik-2'])
  })

  it('toggleDeck delegates the write to the settings store', async () => {
    const grammar = useGrammarStore()
    const settings = useSettingsStore()
    await grammar.toggleDeck('topik-3')
    expect(settings.excludedDeckIds).toEqual(['topik-3'])
    expect(grammar.excludedDeckIds).toEqual(['topik-3'])
  })

  it('activeIndices drops items whose deck is excluded', async () => {
    const grammar = useGrammarStore()
    const settings = useSettingsStore()
    grammar.items = [g('topik-1'), g('topik-2'), g('topik-1')]
    expect(grammar.activeIndices).toEqual([0, 1, 2])
    await settings.toggleDeck('topik-2')
    expect(grammar.activeIndices).toEqual([0, 2])
  })
})
