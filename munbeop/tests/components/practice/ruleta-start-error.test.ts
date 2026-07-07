import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { ref, computed } from 'vue'
import RuletaPage from '~/pages/practice/ruleta.vue'
import DeckPicker from '~/components/games/ruleta/DeckPicker.vue'
import { useToast } from '~/composables/useToast'

// Regression: session-start failures used to toast the raw exception text
// ("Failed to fetch" / "Unknown error") untranslated in all 8 locales — the
// only toast.error in the app that bypassed t(). It must now toast the
// localized practice.start_failed key (key-echo useI18n stub).
const error = ref<string | null>(null)
const start = vi.fn(async () => {
  error.value = 'Failed to fetch'
})
vi.stubGlobal('definePageMeta', () => {})
vi.stubGlobal('useRoute', () => ({ query: {} }))
vi.stubGlobal('useRouter', () => ({ replace: vi.fn() }))
vi.stubGlobal('useToast', useToast)
vi.stubGlobal('usePractice', () => ({
  session: ref(null),
  error,
  completed: computed(() => false),
  start,
  grammarOf: () => null,
  currentContextOf: () => null,
  persistEntry: vi.fn(),
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

let errSpy: ReturnType<typeof vi.spyOn>

describe('ruleta — session-start failure toast is localized', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    error.value = null
    start.mockClear()
    useToast().dismiss()
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errSpy.mockRestore()
  })

  it('toasts the practice.start_failed key, never the raw exception text', async () => {
    const w = shallowMount(RuletaPage)
    w.findComponent(DeckPicker).vm.$emit('select', null)
    await flushPromises()

    const toasts = useToast().toasts.value
    expect(toasts.some((x) => x.variant === 'error' && x.text.includes('practice.start_failed'))).toBe(true)
    expect(toasts.some((x) => x.text.includes('Failed to fetch'))).toBe(false)
    // the raw message stays available for debugging
    expect(errSpy).toHaveBeenCalledWith('ruleta: session start failed:', 'Failed to fetch')
  })
})
