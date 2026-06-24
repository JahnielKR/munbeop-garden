import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AchievementsSection from '~/components/library/GrammarStudySheet/AchievementsSection.vue'
import type { Grammar } from '~/lib/domain'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let srsState: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let logEntries: any[]
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ ensure: () => srsState }) }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ entries: logEntries }) }))

function grammar(ko = '-지만'): Grammar {
  return { ko, meaning: {} as never, deckId: 'topik-1' }
}
function easyEntries(n: number, ko = '-지만') {
  return Array.from({ length: n }, (_, i) => ({
    id: i, ko, sentence: 's', feedback: 'easy', errorNote: null,
    reviewState: 'unreviewed', contextId: 'c', contextName: 'C',
    date: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
  }))
}

describe('AchievementsSection', () => {
  beforeEach(() => {
    srsState = { mastery: 'seedling', lastSeen: null, easyCount: 0, hardCount: 0 }
    logEntries = []
  })

  it('always renders all six badges', () => {
    const wrapper = mount(AchievementsSection, { props: { grammar: grammar() } })
    expect(wrapper.findAll('.ach').length).toBe(6)
  })

  it('shows everything locked for a fresh, never-practiced point', () => {
    const wrapper = mount(AchievementsSection, { props: { grammar: grammar() } })
    expect(wrapper.findAll('.ach--earned').length).toBe(0)
    expect(wrapper.findAll('.ach--locked').length).toBe(6)
  })

  it('lights the earned badges from live SRS + log', () => {
    srsState = { mastery: 'tree', lastSeen: 1, easyCount: 10, hardCount: 0 }
    logEntries = easyEntries(10)
    const wrapper = mount(AchievementsSection, { props: { grammar: grammar() } })
    // 10 easy reviews + tree mastery => sprouted, practiced_10, streak_5, mastered
    expect(wrapper.findAll('.ach--earned').length).toBe(4)
    expect(wrapper.findAll('.ach--locked').length).toBe(2) // practiced_25, comeback
  })

  it('ignores log entries for other grammar points', () => {
    logEntries = easyEntries(10, '다른-문법')
    const wrapper = mount(AchievementsSection, { props: { grammar: grammar('-지만') } })
    expect(wrapper.findAll('.ach--earned').length).toBe(0)
  })
})
