import { describe, it, expect } from 'vitest'
import { dedupeGrammarByKo } from '~/lib/domain'
import type { Grammar } from '~/lib/domain'

const L = { en: '', es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' }
const g = (ko: string, deckId: string): Grammar => ({ ko, meaning: L, deckId })

describe('dedupeGrammarByKo', () => {
  it('keeps the first occurrence of each ko and drops later duplicates', () => {
    // Catalog-first ordering: the catalog entry precedes the custom copy, so the
    // catalog wins (the library shows the canonical one). A genuinely-distinct
    // custom ko survives.
    const items = [g('-아/어요', 'topik-1'), g('-아/어요', 'custom'), g('나만의', 'custom')]
    const out = dedupeGrammarByKo(items)
    expect(out.map((x) => x.ko)).toEqual(['-아/어요', '나만의'])
    expect(out[0]!.deckId).toBe('topik-1')
  })

  it('returns every entry unchanged when all ko are unique', () => {
    const items = [g('-아/어요', 'topik-1'), g('-(으)면', 'topik-1'), g('내것', 'custom')]
    expect(dedupeGrammarByKo(items)).toEqual(items)
  })

  it('does not mutate the input array', () => {
    const items = [g('A', 'topik-1'), g('A', 'custom')]
    const copy = [...items]
    dedupeGrammarByKo(items)
    expect(items).toEqual(copy)
  })
})
