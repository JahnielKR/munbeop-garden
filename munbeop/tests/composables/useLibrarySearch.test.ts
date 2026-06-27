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
  useGrammarStore: () => ({
    get items() { return items.value },
    // The Library searches the catalog only — custom-deck grammars are excluded.
    get catalogItems() { return items.value.filter((g) => g.deckId !== 'custom') },
  }),
}))

// Mastery filtering reads the SRS store + leech signal; mock both (controllable
// via the hoisted `mock` so tests can drive mastery levels and the leech set).
const mock = vi.hoisted(() => ({ leechKos: new Set<string>(), masteryByKo: {} as Record<string, string> }))
vi.mock('~/stores/srs', () => ({
  useSrsStore: () => ({ peek: (ko: string) => ({ mastery: mock.masteryByKo[ko] ?? 'seedling' }) }),
}))
vi.mock('~/composables/useLeeches', () => ({
  useLeeches: () => ({ leechKos: { value: mock.leechKos } }),
}))

describe('useLibrarySearch', () => {
  let scope: EffectScope
  beforeEach(() => {
    routeQuery.value = {}; replaceSpy.mockClear(); scope = effectScope()
    mock.leechKos = new Set(); mock.masteryByKo = {}
  })
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

  it('parses ?mastery= and reflects it in isFiltering', () => {
    routeQuery.value = { mastery: 'tree' }
    const { mastery, isFiltering } = use()
    expect(mastery.value).toBe('tree')
    expect(isFiltering.value).toBe(true)
  })

  it('ignores an invalid ?mastery=', () => {
    routeQuery.value = { mastery: 'leaf' }
    expect(use().mastery.value).toBe(null)
  })

  it('?mastery=hard keeps only the leech set', () => {
    mock.leechKos = new Set(['은/는'])
    routeQuery.value = { mastery: 'hard' }
    expect(use().results.value.map((g) => g.ko)).toEqual(['은/는'])
  })

  it('?mastery=hard excludes a non-leech item', () => {
    mock.leechKos = new Set(['something-else'])
    routeQuery.value = { mastery: 'hard' }
    expect(use().results.value).toEqual([])
  })

  it('?mastery=tree excludes a seedling-level item', () => {
    routeQuery.value = { mastery: 'tree' } // 은/는 defaults to seedling
    expect(use().results.value).toEqual([])
  })

  it('setMastery writes ?mastery= via replace', () => {
    use().setMastery('hard')
    expect(replaceSpy).toHaveBeenCalledWith({ query: { mastery: 'hard' } })
  })

  it('results returns the single item when unfiltered', () => {
    expect(use().results.value.map((g) => g.ko)).toEqual(['은/는'])
  })

  it('results exclude user custom-deck grammars', () => {
    items.value = [
      ...items.value,
      { ko: '나만의', meaning: { en: 'mine', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' }, deckId: 'custom' },
    ]
    expect(use().results.value.map((g) => g.ko)).toEqual(['은/는'])
    items.value = items.value.filter((g) => g.deckId !== 'custom')
  })
})
