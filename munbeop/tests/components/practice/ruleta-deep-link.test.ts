import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { computed, reactive, ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import RuletaPage from '~/pages/practice/ruleta.vue'
import CardDraw from '~/components/games/ruleta/CardDraw.vue'
import { useAuthStore } from '~/stores/auth'
import { useAppStatus } from '~/stores/appStatus'
import { useToast } from '~/composables/useToast'

const query = reactive<Record<string, unknown>>({})
const replace = vi.fn(async () => {})
const session = ref<{ picks: unknown[] } | null>(null)
const error = ref<string | null>(null)
const start = vi.fn(async () => {
  session.value = { picks: [] }
})
const reset = vi.fn(() => {
  session.value = null
  error.value = null
})

vi.stubGlobal('definePageMeta', () => {})
vi.stubGlobal('useRoute', () => ({ query }))
vi.stubGlobal('useRouter', () => ({ replace }))
vi.stubGlobal('useToast', useToast)
vi.stubGlobal('usePractice', () => ({
  session,
  error,
  completed: computed(() => false),
  start,
  grammarOf: () => null,
  currentContextOf: () => null,
  persistEntry: vi.fn(),
  reset,
}))

const grammarItems = [
  { ko: 'A', deckId: 'topik-1' },
  { ko: 'B', deckId: 'topik-1' },
  { ko: 'C', deckId: 'topik-1' },
]
vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({
    decks: [{ id: 'topik-1', name: 'TOPIK 1', colorId: 'sky', order: 1 }],
    items: grammarItems,
    excludedDeckIds: [],
    activeIndices: [0, 1, 2],
  }),
}))
vi.mock('~/stores/customDecks', () => ({
  useCustomDecksStore: () => ({ decks: [], deckById: () => null }),
}))
const srsMap: Record<string, {
  lastSeen: number | null
  easyCount: number
  hardCount: number
  mastery: 'seedling'
}> = {}
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ map: srsMap }) }))
vi.mock('~/stores/settings', () => ({ useSettingsStore: () => ({ startingDeckId: null }) }))
vi.mock('~/stores/bomi', () => ({ useBomiStore: () => ({ react: vi.fn(), activePose: 'idle' }) }))
vi.mock('~/composables/useGameLeaveGuard', () => ({ useGameLeaveGuard: () => {} }))
vi.mock('~/composables/useLeeches', () => ({
  useLeeches: () => ({ leechKos: { value: new Set<string>() } }),
}))

describe('ruleta deep links', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    for (const key of Object.keys(query)) Reflect.deleteProperty(query, key)
    for (const key of Object.keys(srsMap)) Reflect.deleteProperty(srsMap, key)
    session.value = null
    error.value = null
    start.mockClear()
    reset.mockClear()
    replace.mockClear()
    useToast().dismiss()
  })

  it('waits for restored account data before starting a focus round', async () => {
    query.focus = 'A'
    const auth = useAuthStore()
    auth.user = { id: 'user-1' } as never
    auth.ready = false
    useAppStatus().status = 'idle'

    const wrapper = shallowMount(RuletaPage)
    await flushPromises()
    expect(start).not.toHaveBeenCalled()

    auth.ready = true
    useAppStatus().status = 'loading'
    await flushPromises()
    expect(start).not.toHaveBeenCalled()

    useAppStatus().status = 'ready'
    await flushPromises()
    expect(start).toHaveBeenCalledTimes(1)
    expect(start).toHaveBeenCalledWith()
    expect(wrapper.find('.session').exists()).toBe(true)
  })

  it('consumes a revisit query whose only due row is an orphan', async () => {
    query.revisit = 'due'
    srsMap.orphan = {
      lastSeen: Date.now() - 30 * 86_400_000,
      easyCount: 0,
      hardCount: 1,
      mastery: 'seedling',
    }
    const auth = useAuthStore()
    auth.user = { id: 'user-1' } as never
    auth.ready = true
    useAppStatus().status = 'ready'

    shallowMount(RuletaPage)
    await flushPromises()
    expect(start).not.toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith({ query: {} })
  })

  it('starts the placement-recommended deck from its explicit query', async () => {
    query.deck = 'topik-1'
    const auth = useAuthStore()
    auth.user = { id: 'user-1' } as never
    auth.ready = true
    useAppStatus().status = 'ready'

    const wrapper = shallowMount(RuletaPage)
    await flushPromises()
    expect(start).toHaveBeenCalledWith({ deckId: 'topik-1' })
    expect(wrapper.findComponent(CardDraw).exists()).toBe(true)
  })
})
