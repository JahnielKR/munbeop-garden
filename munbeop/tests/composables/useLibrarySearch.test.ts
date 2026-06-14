import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { effectScope, ref, type EffectScope } from 'vue'
import { useLibrarySearch as useRaw } from '~/composables/useLibrarySearch'

const routeQuery = ref<Record<string, string | undefined>>({})
const replaceSpy = vi.fn(async () => {})
vi.stubGlobal('useRoute', () => ({ get query() { return routeQuery.value } }))
vi.stubGlobal('useRouter', () => ({ replace: replaceSpy }))

const items = ref([
  { ko: '은/는', meaning: { en: 'topic', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' }, deckId: 'topik-1' },
])
vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({ get items() { return items.value } }),
}))

describe('useLibrarySearch', () => {
  let scope: EffectScope
  beforeEach(() => { routeQuery.value = {}; replaceSpy.mockClear(); scope = effectScope() })
  afterEach(() => { scope.stop() })
  const use = () => scope.run(() => useRaw())!

  it('isFiltering is false with no query/filters', () => {
    expect(use().isFiltering.value).toBe(false)
  })

  it('reads ?q= into query and isFiltering', () => {
    routeQuery.value = { q: '은' }
    const { query, isFiltering } = use()
    expect(query.value).toBe('은')
    expect(isFiltering.value).toBe(true)
  })

  it('parses ?level= and reflects it in isFiltering', () => {
    routeQuery.value = { level: '3' }
    const { level, isFiltering } = use()
    expect(level.value).toBe(3)
    expect(isFiltering.value).toBe(true)
  })

  it('ignores an out-of-range ?level=', () => {
    routeQuery.value = { level: '9' }
    expect(use().level.value).toBe(null)
  })

  it('setLevel writes ?level= via replace, preserving other params', () => {
    routeQuery.value = { grammar: '은/는' }
    use().setLevel(3)
    expect(replaceSpy).toHaveBeenCalledWith({ query: { grammar: '은/는', level: 3 } })
  })

  it('setCategory(null) removes ?cat=', () => {
    routeQuery.value = { cat: 'particle', grammar: '은/는' }
    use().setCategory(null)
    expect(replaceSpy).toHaveBeenCalledWith({ query: { grammar: '은/는' } })
  })

  it('clear drops q/level/cat/theme but keeps grammar', () => {
    routeQuery.value = { q: '은', level: '1', cat: 'particle', theme: 'x', grammar: '은/는' }
    use().clear()
    expect(replaceSpy).toHaveBeenCalledWith({ query: { grammar: '은/는' } })
  })

  it('results returns the single item when unfiltered', () => {
    expect(use().results.value.map((g) => g.ko)).toEqual(['은/는'])
  })
})
