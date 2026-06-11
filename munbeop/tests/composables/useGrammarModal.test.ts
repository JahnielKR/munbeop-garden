import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, ref, type EffectScope } from 'vue'
import { useGrammarModal as useGrammarModalRaw } from '~/composables/useGrammarModal'

const routeQuery = ref<Record<string, string | undefined>>({})
const pushSpy = vi.fn(async () => {})
const replaceSpy = vi.fn(async () => {})

// `useRoute()` returns a live wrapper, not a snapshot. Watchers from
// earlier tests stay subscribed across the file's lifetime, so if the
// `query` property captured the value at call time, those stale watchers
// would keep firing against their old object and pollute later tests.
vi.stubGlobal('useRoute', () => ({
  get query() {
    return routeQuery.value
  },
}))
vi.stubGlobal('useRouter', () => ({ push: pushSpy, replace: replaceSpy }))

const fakeGrammar = {
  ko: '-(으)니까',
  meaning: { en: 'because', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}

const storeItems = ref<typeof fakeGrammar[]>([fakeGrammar])
const grammarByKo = vi.fn((ko: string) =>
  storeItems.value.find((g) => g.ko === ko),
)
vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({
    grammarByKo,
    get items() {
      return storeItems.value
    },
  }),
}))

describe('useGrammarModal', () => {
  let scope: EffectScope

  beforeEach(() => {
    routeQuery.value = {}
    storeItems.value = [fakeGrammar]
    pushSpy.mockClear()
    replaceSpy.mockClear()
    grammarByKo.mockClear()
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
  })

  // Scope every composable invocation so watchers don't leak across tests.
  // useGrammarModalRaw sets up a watcher with `immediate: true`; without
  // scoping, prior tests' watchers stay subscribed and fire on every later
  // routeQuery / storeItems mutation, polluting spy counts.
  function useGrammarModal() {
    return scope.run(() => useGrammarModalRaw())!
  }

  it('selected is null when ?grammar= is absent', () => {
    const { selected, isOpen } = useGrammarModal()
    expect(selected.value).toBe(null)
    expect(isOpen.value).toBe(false)
  })

  it('selected resolves the grammar when ?grammar= matches a known ko', () => {
    routeQuery.value = { grammar: '-(으)니까' }
    const { selected, isOpen } = useGrammarModal()
    expect(selected.value).toEqual(fakeGrammar)
    expect(isOpen.value).toBe(true)
  })

  it('selected is null and replace is called when ?grammar= is unknown', async () => {
    routeQuery.value = { grammar: 'fake-pattern' }
    const { selected } = useGrammarModal()
    expect(selected.value).toBe(null)
    await Promise.resolve()
    expect(replaceSpy).toHaveBeenCalledTimes(1)
  })

  it('open(ko) calls router.push with the grammar query merged in', async () => {
    routeQuery.value = { theme: 'dark' }
    const { open } = useGrammarModal()
    await open('-(으)니까')
    expect(pushSpy).toHaveBeenCalledWith({ query: { theme: 'dark', grammar: '-(으)니까' } })
  })

  it('close() calls router.replace and preserves other query params', async () => {
    routeQuery.value = { theme: 'dark', grammar: '-(으)니까' }
    const { close } = useGrammarModal()
    await close()
    expect(replaceSpy).toHaveBeenCalledWith({ query: { theme: 'dark' } })
  })

  it('open() with the same ko already present is a no-op (no duplicate push)', async () => {
    routeQuery.value = { grammar: '-(으)니까' }
    const { open } = useGrammarModal()
    await open('-(으)니까')
    expect(pushSpy).not.toHaveBeenCalled()
  })

  it('does NOT wipe ?grammar= while the store is still hydrating (items empty)', async () => {
    // Deep-link load: query is set, store hasn't hydrated yet.
    storeItems.value = []
    routeQuery.value = { grammar: '-(으)니까' }
    const { selected } = useGrammarModal()
    expect(selected.value).toBe(null)
    await Promise.resolve()
    expect(replaceSpy).not.toHaveBeenCalled()
  })

  it('resolves the grammar once items hydrates after a deep-link load', async () => {
    // Deep-link load with empty items.
    storeItems.value = []
    routeQuery.value = { grammar: '-(으)니까' }
    const { selected, isOpen } = useGrammarModal()
    expect(selected.value).toBe(null)
    // Hydration arrives.
    storeItems.value = [fakeGrammar]
    await Promise.resolve()
    expect(selected.value).toEqual(fakeGrammar)
    expect(isOpen.value).toBe(true)
    expect(replaceSpy).not.toHaveBeenCalled()
  })
})
