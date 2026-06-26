import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import StatsPage from '~/pages/stats.vue'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useGrammarStore } from '~/stores/grammar'
import type { Grammar, LogEntry, SrsState } from '~/lib/domain'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

const L = (en: string) => ({ en, es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' })
const g = (ko: string, deckId: string): Grammar => ({ ko, meaning: L(ko), deckId })
const srs = (over: Partial<SrsState>): SrsState => ({ lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling', ...over })
let nextId = 1
const entry = (over: Partial<LogEntry>): LogEntry => ({
  id: nextId++,
  ko: 'koA',
  sentence: 's',
  feedback: 'easy',
  errorNote: null,
  reviewState: 'correct',
  contextId: 'banmal',
  contextName: '반말',
  date: new Date().toISOString(),
  ...over,
})

function seedWithData() {
  useGrammarStore().items = [g('koA', 'topik-1'), g('koB', 'topik-2')]
  useSrsStore().map = { koA: srs({ hardCount: 9, mastery: 'tree' }), koB: srs({ hardCount: 2, mastery: 'plant' }) }
  useLogStore().entries = [entry({ feedback: 'easy' }), entry({ feedback: 'hard' })]
}

describe('stats page', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows the guiding empty state when there is no data', () => {
    const w = mount(StatsPage)
    expect(w.find('[data-test="stats-empty"]').exists()).toBe(true)
    expect(w.findAll('[data-test="hero-card"]')).toHaveLength(0)
  })

  it('renders the four sections when there is data', () => {
    seedWithData()
    const w = mount(StatsPage)
    expect(w.find('[data-test="stats-empty"]').exists()).toBe(false)
    expect(w.findAll('[data-test="hero-card"]')).toHaveLength(4)
    expect(w.findAll('[data-test="mastery-row"]')).toHaveLength(6)
    expect(w.find('[data-test="rhythm"]').exists()).toBe(true)
    expect(w.findAll('[data-test="tough-row"]').length).toBeGreaterThan(0)
  })

  it('renders the global trophy wall with earned + locked states', () => {
    seedWithData()
    const w = mount(StatsPage)
    expect(w.find('[data-test="achievements"]').exists()).toBe(true)
    expect(w.findAll('[data-test="trophy"]')).toHaveLength(17)
    // koA is a tree and a review is logged → the early trophies light up; the
    // catalog is nowhere near complete → the capstone stays locked.
    const earned = w.findAll('.trophy--earned img').map((i) => i.attributes('src'))
    expect(earned).toContain('/img/achievements/first_sprout.png')
    expect(earned).toContain('/img/achievements/topik_1_mastered.png')
    expect(earned).not.toContain('/img/achievements/garden_complete.png')
  })

  it('deep-links the toughest grammar to a focused practice round', () => {
    seedWithData()
    const w = mount(StatsPage)
    const link = w.find('[data-test="tough-practice"]')
    expect(link.exists()).toBe(true)
    // koA has the highest hardCount, so it leads the list.
    expect(link.attributes('href')).toContain('/practice/ruleta?focus=koA')
  })

  it('exposes the rhythm chart as a labelled image for screen readers', () => {
    seedWithData()
    const w = mount(StatsPage)
    const chart = w.find('.rhythm')
    expect(chart.attributes('role')).toBe('img')
    expect((chart.attributes('aria-label') ?? '').length).toBeGreaterThan(0)
  })

  it('hides the easy/hard ratio when there are no rated log entries (srs-only user)', () => {
    // srs rows but no log entries → split.easy + split.hard === 0
    useGrammarStore().items = [g('koA', 'topik-1')]
    useSrsStore().map = { koA: srs({ mastery: 'plant' }) }
    const w = mount(StatsPage)
    expect(w.find('[data-test="stats-empty"]').exists()).toBe(false) // srs alone counts as data
    expect(w.find('.ratio').exists()).toBe(false)
  })
})
