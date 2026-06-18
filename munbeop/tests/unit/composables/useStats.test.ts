import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStats } from '~/composables/useStats'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useGrammarStore } from '~/stores/grammar'
import type { Grammar, LogEntry, SrsState } from '~/lib/domain'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

const DAY = 86_400_000
const now = 1_700_000_000_000
const dayIso = (k: number) => new Date((Math.floor(now / DAY) - k) * DAY + 3_600_000).toISOString()

const L = (en: string) => ({ en, es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' })
const g = (ko: string, deckId: string): Grammar => ({ ko, meaning: L(ko), deckId })
const srs = (over: Partial<SrsState>): SrsState => ({ lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling', ...over })
let nextId = 1
const entry = (over: Partial<LogEntry>): LogEntry => ({
  id: nextId++,
  ko: 'koA',
  sentence: 's',
  feedback: 'hard',
  errorNote: null,
  reviewState: 'unreviewed',
  contextId: 'banmal',
  contextName: '반말',
  date: dayIso(0),
  ...over,
})

describe('useStats', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('derives sentence count, day streak, mastered/total and pending reviews', () => {
    useGrammarStore().items = [g('koA', 'topik-1'), g('koB', 'topik-1')]
    useSrsStore().map = { koA: srs({ hardCount: 3, mastery: 'tree' }) }
    useLogStore().entries = [entry({ date: dayIso(0) }), entry({ date: dayIso(1), feedback: 'easy' })]

    const s = useStats(now)
    expect(s.sentences.value).toBe(2)
    expect(s.streak.value).toBe(2)
    expect(s.masteredCount.value).toBe(1)
    expect(s.catalogTotal.value).toBe(2)
    expect(s.pendingReviews.value).toBe(1) // only the hard, unreviewed one
    expect(s.hasData.value).toBe(true)
  })

  it('exposes mastery levels, weekly rhythm, easy/hard split, toughest and top contexts', () => {
    useGrammarStore().items = [g('koA', 'topik-1'), g('koB', 'topik-2')]
    useSrsStore().map = { koA: srs({ hardCount: 9, mastery: 'tree' }), koB: srs({ hardCount: 2, mastery: 'plant' }) }
    useLogStore().entries = [
      entry({ feedback: 'easy', contextName: '반말' }),
      entry({ feedback: 'easy', contextName: '반말' }),
      entry({ feedback: 'hard', contextName: '존댓말' }),
    ]

    const s = useStats(now)
    expect(s.masteryLevels.value).toHaveLength(6)
    expect(s.masteryLevels.value.find((l) => l.level === 1)?.tree).toBe(1)
    expect(s.weekly.value).toHaveLength(8)
    expect(s.weekly.value[7]).toBe(3) // all three this week
    expect(s.split.value).toEqual({ easy: 2, hard: 1, easyPct: 67 })
    expect(s.toughest.value.map((t) => t.ko)).toEqual(['koA', 'koB'])
    expect(s.topContexts.value[0]).toEqual({ name: '반말', count: 2 })
  })

  it('reports no data for a fresh account', () => {
    const s = useStats(now)
    expect(s.hasData.value).toBe(false)
    expect(s.sentences.value).toBe(0)
    expect(s.streak.value).toBe(0)
  })
})
