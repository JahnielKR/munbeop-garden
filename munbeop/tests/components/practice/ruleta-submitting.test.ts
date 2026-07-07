import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import RuletaPage from '~/pages/practice/ruleta.vue'
import GrammarCard from '~/components/practice/GrammarCard.vue'
import DeckPicker from '~/components/games/ruleta/DeckPicker.vue'
import CardDraw from '~/components/games/ruleta/CardDraw.vue'
import { useToast } from '~/composables/useToast'

// usePractice mock whose persistEntry hands out one manually-resolvable
// promise per call, so the test can hold two cards' cloud writes in flight
// at once and settle them in any order.
const resolvers: Array<(v: unknown) => void> = []
const persistEntry = vi.fn(
  () => new Promise((resolve) => { resolvers.push(resolve) }),
)
const empty = { en: '', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' }
const session = ref({
  deckId: null,
  picks: [
    { grammarIndex: 0, progress: 0 },
    { grammarIndex: 1, progress: 0 },
    { grammarIndex: 2, progress: 0 },
  ],
})
vi.stubGlobal('definePageMeta', () => {})
vi.stubGlobal('useRoute', () => ({ query: {} }))
vi.stubGlobal('useRouter', () => ({ replace: vi.fn() }))
vi.stubGlobal('useToast', useToast)
vi.stubGlobal('usePractice', () => ({
  session,
  error: ref<string | null>(null),
  completed: computed(() => false),
  start: vi.fn(async () => {}),
  grammarOf: (i: number) => ({ ko: `문법-${i}`, meaning: { ...empty, en: 'x' }, deckId: 'topik-1' }),
  currentContextOf: () => ({
    id: 'c1',
    name: '반말',
    scene: { ...empty },
    category: 'formalidad' as const,
    builtin: true,
  }),
  persistEntry,
  reset: vi.fn(),
}))

vi.mock('~/stores/bomi', () => ({ useBomiStore: () => ({ react: vi.fn(), activePose: 'idle' }) }))
vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({ decks: [], items: [], excludedDeckIds: [], hydrate: async () => {} }),
}))
vi.mock('~/stores/contexts', () => ({ useContextsStore: () => ({ hydrate: async () => {} }) }))
vi.mock('~/stores/customDecks', () => ({
  useCustomDecksStore: () => ({ decks: [], deckById: () => null, hydrate: async () => {} }),
}))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ map: {}, hydrate: async () => {} }) }))
vi.mock('~/stores/settings', () => ({ useSettingsStore: () => ({ startingDeckId: null }) }))
vi.mock('~/composables/useGameLeaveGuard', () => ({ useGameLeaveGuard: () => {} }))
vi.mock('~/composables/useLeeches', () => ({
  useLeeches: () => ({ leechKos: { value: new Set<string>() } }),
}))

function payload(pickIndex: number) {
  return { pickIndex, sentence: '저는 학생이에요', feedback: 'easy' as const, errorNote: null }
}

/** Drive the page pick → draw → play so the three GrammarCards render. */
async function mountInPlay() {
  const w = shallowMount(RuletaPage)
  w.findComponent(DeckPicker).vm.$emit('select', null)
  await flushPromises()
  w.findComponent(CardDraw).vm.$emit('done')
  await flushPromises()
  return w
}

describe('ruleta — per-card in-flight submit latch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    resolvers.length = 0
    persistEntry.mockClear()
    useToast().dismiss()
  })

  it('a cross-card submit does not drop another card´s in-flight latch', async () => {
    const w = await mountInPlay()
    const cards = w.findAllComponents(GrammarCard)
    expect(cards).toHaveLength(3)

    cards[0]!.vm.$emit('submit', payload(0))
    await nextTick()
    expect(cards[0]!.props('submitting')).toBe(true)

    // Regression: submitting card B used to overwrite a single shared
    // `submittingPick` ref, dropping A's latch while A's write was still in
    // flight — GrammarCard re-arms on the falling edge of :submitting, so a
    // re-tap on A could double-log the answer and skip its next context.
    cards[1]!.vm.$emit('submit', payload(1))
    await nextTick()
    expect(cards[0]!.props('submitting')).toBe(true)
    expect(cards[1]!.props('submitting')).toBe(true)

    // B's write settles first — only B re-enables; A stays latched.
    resolvers[1]!(null)
    await flushPromises()
    expect(cards[0]!.props('submitting')).toBe(true)
    expect(cards[1]!.props('submitting')).toBe(false)

    resolvers[0]!(null)
    await flushPromises()
    expect(cards[0]!.props('submitting')).toBe(false)
  })
})
