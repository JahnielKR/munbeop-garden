import { describe, it, expect } from 'vitest'
import type { Grammar, GrammarType, TopikLevel } from '~/lib/domain'
import { normalize, scoreItem, searchLibrary } from '~/lib/library/search'

function g(ko: string, en: string, es = '', opts: Partial<Grammar> = {}): Grammar {
  return { ko, meaning: { en, es, fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' }, deckId: 'd', ...opts }
}

const LEVELS: Record<string, TopikLevel> = { '은/는': 1, '-기 전에': 2, '-더라': 5 }
const CATS: Record<string, GrammarType> = { '은/는': 'particle', '-기 전에': 'expr', '-더라': 'ending' }
const ctxEn = { locale: 'en' as const, levelOf: (ko: string) => LEVELS[ko], categoryOf: (ko: string) => CATS[ko] }
const ctxEs = { ...ctxEn, locale: 'es' as const }

const items: Grammar[] = [
  g('은/는', 'topic particle — marks the topic'),
  g('-기 전에', 'before doing something', 'antes de hacer algo', {
    example: '자기 전에',
    trans: { en: 'before sleeping', es: 'antes de dormir', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' },
  }),
  g('-더라', 'retrospective ending'),
]
const noFilter = { level: null, category: null, themeKos: null }

describe('normalize', () => {
  it('trims and lowercases Latin', () => {
    expect(normalize('  ABC de  ')).toBe('abc de')
  })
  it('NFC-composes decomposed Hangul jamo', () => {
    expect(normalize('은')).toBe('은') // ㅇ+ㅡ+ㄴ → 은
  })
})

describe('scoreItem', () => {
  it('exact ko outranks prefix outranks substring', () => {
    const exact = scoreItem(g('은/는', 'x'), '은/는', 'en')
    const prefix = scoreItem(g('은/는', 'x'), '은', 'en')
    const substr = scoreItem(g('은/는', 'x'), '는', 'en')
    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(substr)
    expect(substr).toBeGreaterThan(0)
  })
  it('meaning match scores lower than ko match', () => {
    const ko = scoreItem(items[1]!, '기', 'en')
    const meaning = scoreItem(items[1]!, 'before', 'en')
    expect(ko).toBeGreaterThan(meaning)
    expect(meaning).toBeGreaterThan(0)
  })
})

describe('searchLibrary', () => {
  it('finds a pattern by its meaning in the active locale (es)', () => {
    const r = searchLibrary(items, { query: 'antes', ...noFilter }, ctxEs)
    expect(r.map((x) => x.ko)).toEqual(['-기 전에'])
  })

  it('does NOT match romanization (no eun/neun/seyo support)', () => {
    for (const q of ['eun', 'neun', 'seyo']) {
      expect(searchLibrary(items, { query: q, ...noFilter }, ctxEn)).toEqual([])
    }
  })

  it('filters by level', () => {
    const r = searchLibrary(items, { query: '', level: 2, category: null, themeKos: null }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['-기 전에'])
  })

  it('filters by category', () => {
    const r = searchLibrary(items, { query: '', level: null, category: 'particle', themeKos: null }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['은/는'])
  })

  it('ANDs text + level + category', () => {
    const r = searchLibrary(items, { query: '', level: 1, category: 'particle', themeKos: null }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['은/는'])
  })

  it('empty query returns all (filtered) items in level-then-index order', () => {
    const r = searchLibrary(items, { query: '', ...noFilter }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['은/는', '-기 전에', '-더라'])
  })

  it('restricts to themeKos when provided', () => {
    const r = searchLibrary(items, { query: '', level: null, category: null, themeKos: new Set(['-더라']) }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['-더라'])
  })

  it('matches only the trans field (lowest tier) and returns that item', () => {
    const r = searchLibrary(items, { query: 'sleeping', ...noFilter }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['-기 전에'])
  })

  it('matches the Korean example field', () => {
    const r = searchLibrary(items, { query: '자기', ...noFilter }, ctxEn)
    expect(r.map((x) => x.ko)).toEqual(['-기 전에'])
  })

  it('orders ko matches above meaning-only matches', () => {
    const fixture = [
      g('meaning-only', 'contains zzz keyword'),
      g('zzz', 'a pattern'),
    ]
    const ctx = { locale: 'en' as const, levelOf: () => undefined, categoryOf: () => undefined }
    const r = searchLibrary(fixture, { query: 'zzz', ...noFilter }, ctx)
    expect(r.map((x) => x.ko)).toEqual(['zzz', 'meaning-only'])
  })

  it('falls back to the en meaning when the active locale value is empty', () => {
    // item 0 has es:'' → localized() falls back to en 'topic particle…' which contains 'topic'
    const r = searchLibrary(items, { query: 'topic', ...noFilter }, ctxEs)
    expect(r.map((x) => x.ko)).toEqual(['은/는'])
  })
})
