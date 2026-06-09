import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

const routeQuery = ref<Record<string, string | undefined>>({})
const pushSpy = vi.fn(async () => {})
const replaceSpy = vi.fn(async () => {})

vi.stubGlobal('useRoute', () => ({ query: routeQuery.value }))
vi.stubGlobal('useRouter', () => ({ push: pushSpy, replace: replaceSpy }))

const fakeGrammar = {
  ko: '-(으)니까',
  meaning: { en: 'because', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  deckId: 'topik-1',
}

const grammarByKo = vi.fn((ko: string) => (ko === fakeGrammar.ko ? fakeGrammar : undefined))
vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({ grammarByKo, items: [fakeGrammar] }),
}))

import { useGrammarModal } from '~/composables/useGrammarModal'

describe('useGrammarModal', () => {
  beforeEach(() => {
    routeQuery.value = {}
    pushSpy.mockClear()
    replaceSpy.mockClear()
    grammarByKo.mockClear()
  })

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
})
