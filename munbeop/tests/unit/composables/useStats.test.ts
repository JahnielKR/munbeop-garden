import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStats } from '~/composables/useStats'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useActivityStore } from '~/stores/activity'
import { useSettingsStore } from '~/stores/settings'
import { keyOfOrdinal, localDayKey, ordinalOf } from '~/lib/stats/activity'
import type { Grammar, LogEntry, SrsState } from '~/lib/domain'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

const DAY = 86_400_000
const now = 1_700_000_000_000
const dayIso = (k: number) => new Date((Math.floor(now / DAY) - k) * DAY + 3_600_000).toISOString()

const L = (en: string) => ({ en, es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' })
const g = (ko: string, deckId: string): Grammar => ({ ko, meaning: L(ko), deckId })
const srs = (over: Partial<SrsState>): SrsState => ({
  lastSeen: null,
  easyCount: 0,
  hardCount: 0,
  mastery: 'seedling',
  ...over,
})
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
    useLogStore().entries = [
      entry({ date: dayIso(0) }),
      entry({ date: dayIso(1), feedback: 'easy' }),
    ]

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
    useSrsStore().map = {
      koA: srs({ hardCount: 9, mastery: 'tree' }),
      koB: srs({ hardCount: 2, mastery: 'plant' }),
    }
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

  it('ignores deleted/custom srs rows in catalog mastery and toughest links', () => {
    useGrammarStore().items = [g('catalog', 'topik-1'), g('custom', 'custom')]
    useSrsStore().map = {
      catalog: srs({ mastery: 'tree', hardCount: 2 }),
      custom: srs({ mastery: 'tree', hardCount: 3 }),
      deleted: srs({ mastery: 'tree', hardCount: 99 }),
    }

    const stats = useStats(now)
    expect(stats.masteredCount.value).toBe(1)
    expect(stats.catalogTotal.value).toBe(1)
    expect(stats.toughest.value.map((item) => item.ko)).toEqual(['custom', 'catalog'])
  })

  it('does not fabricate data or streaks from zero/future activity or orphan srs', () => {
    const today = localDayKey(now)
    const tomorrow = keyOfOrdinal(ordinalOf(today) + 1)
    useActivityStore().map = {
      [today]: { count: 0 },
      [tomorrow]: { count: 9 },
    }
    useSrsStore().map = { deleted: srs({ mastery: 'tree' }) }

    const stats = useStats(now)
    expect(stats.activityCounts.value).toEqual({})
    expect(stats.streak.value).toBe(0)
    expect(stats.longestStreak.value).toBe(0)
    expect(stats.hasData.value).toBe(false)
  })

  it('reactively derives period insights from the selected range and daily goal', () => {
    const today = localDayKey(now)
    const todayOrdinal = ordinalOf(today)
    const day = (offset: number) => keyOfOrdinal(todayOrdinal + offset)
    useSettingsStore().dailyGoal = 4
    useActivityStore().map = {
      [today]: { count: 5 },
      [day(-6)]: { count: 3 },
      [day(-7)]: { count: 2 },
      [day(-29)]: { count: 4 },
    }

    const stats = useStats(now)
    expect(stats.insightPeriod.value).toBe(7)
    expect(stats.periodInsights.value).toMatchObject({
      actions: 8,
      activeDays: 2,
      goalDays: 1,
      goalTarget: 28,
      previousActions: 2,
      changeFromPrevious: 6,
    })

    stats.insightPeriod.value = 30
    expect(stats.periodInsights.value.actions).toBe(14)
    expect(stats.periodInsights.value.goalTarget).toBe(120)

    useSettingsStore().dailyGoal = 2
    expect(stats.periodInsights.value.goalTarget).toBe(60)
    expect(stats.periodInsights.value.goalDays).toBe(4)

    stats.insightPeriod.value = 'all'
    expect(stats.periodInsights.value.goalTarget).toBeNull()
    expect(stats.periodInsights.value.changeFromPrevious).toBeNull()
  })
})
