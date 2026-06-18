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

  it('deep-links the toughest grammar to a focused practice round', () => {
    seedWithData()
    const w = mount(StatsPage)
    const link = w.find('[data-test="tough-practice"]')
    expect(link.exists()).toBe(true)
    // koA has the highest hardCount, so it leads the list.
    expect(link.attributes('href')).toContain('/practice/ruleta?focus=koA')
  })
})
