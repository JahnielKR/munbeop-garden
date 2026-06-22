import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import type { Grammar, LogEntry, LocalizedString } from '~/lib/domain'
import { useLeeches } from '~/composables/useLeeches'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

// Shared reactive state the mocked stores read from.
const state = reactive({ entries: [] as LogEntry[], items: [] as Grammar[] })
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ get entries() { return state.entries } }) }))
vi.mock('~/stores/grammar', () => ({ useGrammarStore: () => ({ get items() { return state.items } }) }))

let clock = 0
const e = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: Math.random(),
  ko: '걸리다',
  sentence: 's',
  feedback: 'hard',
  errorNote: null,
  errorDimension: null,
  reviewState: 'unreviewed',
  contextId: 'c',
  contextName: 'c',
  date: new Date(Date.UTC(2026, 0, 1) + clock++ * 60_000).toISOString(),
  ...over,
})

beforeEach(() => {
  state.entries = []
  state.items = [{ ko: '걸리다', meaning: L('to take (time)'), deckId: 'topik-2' }]
  clock = 0
})

describe('useLeeches', () => {
  it('exposes leeches and a leechKos set for a recent-hard grammar', () => {
    state.entries = Array.from({ length: 5 }, () => e({ feedback: 'hard' }))
    const { leeches, leechKos } = useLeeches()
    expect(leeches.value[0]?.ko).toBe('걸리다')
    expect(leechKos.value.has('걸리다')).toBe(true)
  })

  it('is empty when there are no struggling grammars', () => {
    state.entries = Array.from({ length: 5 }, () => e({ feedback: 'easy' }))
    const { leeches, leechKos } = useLeeches()
    expect(leeches.value).toEqual([])
    expect(leechKos.value.size).toBe(0)
  })
})
