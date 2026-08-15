import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { ref } from 'vue'
import ClozePage from '~/pages/practice/cloze.vue'
import CustomDeckShelf from '~/components/games/ruleta/CustomDeckShelf.vue'

const fakeKos = ['FAKE-1', 'FAKE-2', 'FAKE-3', 'FAKE-4', 'FAKE-5', 'FAKE-6']

vi.stubGlobal('definePageMeta', () => {})
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.stubGlobal('useToast', () => ({ info: vi.fn(), error: vi.fn() }))

vi.mock('~/composables/useGameLeaveGuard', () => ({ useGameLeaveGuard: () => {} }))
vi.mock('~/composables/useClozeDrill', () => ({
  useClozeDrill: () => ({
    saveBlocked: ref(false),
    saveStatus: ref('idle'),
    phase: ref('question'),
    runMode: ref('normal'),
    sessionItems: ref([]),
    index: ref(0),
    item: ref(null),
    displayOptions: ref([]),
    picked: ref(null),
    score: ref({ correct: 0, total: 0, accuracy: 0 }),
    failedItems: ref([]),
    start: vi.fn(),
    next: vi.fn(),
    finish: vi.fn(),
    answer: vi.fn(),
    retrySave: vi.fn(),
    replayFailed: vi.fn(),
  }),
}))
vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({
    decks: [],
    items: fakeKos.map((ko) => ({ ko, deckId: 'custom' })),
    excludedDeckIds: [],
    hydrate: vi.fn(),
  }),
}))
vi.mock('~/stores/customDecks', () => ({
  useCustomDecksStore: () => ({
    decks: [{
      id: 'custom-1',
      name: 'Six labels, no exercises',
      colorId: 'sky',
      icon: 'deck-star',
      grammarKos: fakeKos,
      order: 0,
      createdAt: '2026-08-15T00:00:00.000Z',
    }],
    deckById: vi.fn(),
    hydrate: vi.fn(),
  }),
}))

describe('Cloze custom deck picker', () => {
  it('counts playable cloze exercises and locks a nominally large empty deck', () => {
    const wrapper = shallowMount(ClozePage)
    const shelf = wrapper.getComponent(CustomDeckShelf)
    const option = shelf.props('options')[0]

    expect(option).toMatchObject({ id: 'custom-1', count: 0, disabled: true, reason: 'too_few' })
    expect(shelf.props('countLabelKey')).toBe('cloze.custom_item_count')
    expect(shelf.props('lockedLabelKey')).toBe('cloze.custom_locked_need_items')
  })
})
