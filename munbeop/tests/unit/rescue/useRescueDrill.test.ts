import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { ConfusablePair, Grammar, LocalizedString } from '~/lib/domain'
import type { Leech } from '~/lib/srs'
import { useRescueDrill } from '~/composables/useRescueDrill'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

// Mockable seams.
const pairsFor = vi.fn<(ko: string) => unknown[]>(() => [])
const grammarByKo = vi.fn<(ko: string) => Grammar | undefined>(() => undefined)
const leeches = ref<Leech[]>([])

vi.mock('~/lib/grammar-pairs', () => ({ pairsFor: (ko: string) => pairsFor(ko) }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ grammarByKo }) }))
vi.mock('~/composables/useLeeches', () => ({ useLeeches: () => ({ leeches }) }))

const grammar: Grammar = { ko: '-는데', meaning: L('contrast/background'), deckId: 'topik-2' }
const pair = { id: 'p', a: '-는데', b: '-지만', note: L('n'), items: [] } as ConfusablePair

beforeEach(() => {
  pairsFor.mockReturnValue([])
  grammarByKo.mockReturnValue(grammar)
  leeches.value = []
})

describe('useRescueDrill', () => {
  it('omits the discriminate stage when the grammar has no confusable pair', () => {
    const d = useRescueDrill('-는데')
    expect(d.stages.value).toEqual(['reread', 'examples', 'produce'])
  })

  it('includes the discriminate stage when a confusable pair exists', () => {
    pairsFor.mockReturnValue([{ pair, selfSide: 'a', otherKo: '-지만' }])
    const d = useRescueDrill('-는데')
    expect(d.stages.value).toEqual(['reread', 'examples', 'discriminate', 'produce'])
  })

  it('produce is always the last stage', () => {
    pairsFor.mockReturnValue([{ pair, selfSide: 'a', otherKo: '-지만' }])
    const d = useRescueDrill('-는데')
    expect(d.stages.value[d.stages.value.length - 1]).toBe('produce')
  })

  it('surfaces the dominant errorDimension from the matching leech', () => {
    leeches.value = [
      { ko: '-는데', meaning: L('m'), recentHardRatio: 0.6, recentReviews: 5, dominantDimension: 'particle' },
    ]
    const d = useRescueDrill('-는데')
    expect(d.dominantDimension.value).toBe('particle')
  })

  it('dominantDimension is null when the ko is not a current leech', () => {
    const d = useRescueDrill('-는데')
    expect(d.dominantDimension.value).toBeNull()
  })

  it('next/back walk the stages and clamp at the ends', () => {
    const d = useRescueDrill('-는데') // reread, examples, produce
    expect(d.stage.value).toBe('reread')
    expect(d.canBack.value).toBe(false)
    d.next(); expect(d.stage.value).toBe('examples')
    d.next(); expect(d.stage.value).toBe('produce')
    expect(d.isLast.value).toBe(true)
    d.next(); expect(d.stage.value).toBe('produce') // clamped
    d.back(); expect(d.stage.value).toBe('examples')
    d.back(); d.back(); expect(d.stage.value).toBe('reread') // clamped
  })

  it('exposes the grammar object and null for an unknown ko', () => {
    grammarByKo.mockReturnValue(undefined)
    const d = useRescueDrill('없음')
    expect(d.grammar.value).toBeNull()
  })
})
