import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import StatsPage from '~/pages/stats.vue'
import { useSrsStore } from '~/stores/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useActivityStore } from '~/stores/activity'
import type { Grammar, SrsState } from '~/lib/domain'

vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

const L = (en: string) => ({ en, es: '', fr: '', 'pt-BR': '', th: '', id: '', vi: '', ja: '' })
const g = (ko: string, deckId: string): Grammar => ({ ko, meaning: L(ko), deckId })
const srs = (over: Partial<SrsState>): SrsState => ({
  lastSeen: null,
  easyCount: 0,
  hardCount: 0,
  mastery: 'seedling',
  ...over,
})

describe('stats page render smoke', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows the activity heatmap and an all-seedling level reads 0% (no false 100%)', () => {
    // A whole TOPIK-1 level merely browsed (all seedlings) plus some activity.
    useGrammarStore().items = [g('koA', 'topik-1'), g('koB', 'topik-1')]
    useSrsStore().map = { koA: srs({ mastery: 'seedling' }), koB: srs({ mastery: 'seedling' }) }
    useActivityStore().map = { '2026-06-26': { count: 3 }, '2026-06-25': { count: 1 } }

    // Stub the heavy/independent children but keep MasteryBar real so the
    // learned-% bug guard is actually exercised.
    const w = mount(StatsPage, {
      global: {
        stubs: { ActivityHeatmap: true, StrugglingPlants: true },
      },
    })

    // The redesign's first block is the heatmap (stubbed → its tag is present).
    expect(w.find('activity-heatmap-stub').exists()).toBe(true)

    // The all-seedling level must report 0% learned, not 100%.
    const rows = w.findAll('[data-test="mastery-row"]')
    expect(rows.length).toBeGreaterThan(0)
    const topik1 = rows.find((r) => r.text().includes('TOPIK 1'))!
    expect(topik1).toBeTruthy()
    expect(topik1.text()).toContain('0%')
  })
})
