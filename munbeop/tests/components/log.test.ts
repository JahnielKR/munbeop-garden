import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LogPage from '~/pages/log.vue'
import { useLogStore } from '~/stores/log'
import type { LogEntry } from '~/lib/domain'

// useStorageAdapter() reads useNuxtApp(); with no session it resolves to the
// noop adapter (writes dropped), so setReviewState mutates in-memory state only.
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))

function entry(over: Partial<LogEntry>): LogEntry {
  return {
    id: 1,
    ko: '은/는',
    sentence: '저는 학생이에요',
    feedback: 'hard',
    errorNote: null,
    reviewState: 'unreviewed',
    contextId: 'banmal',
    contextName: '반말',
    date: '2026-06-01T00:00:00Z',
    ...over,
  }
}

describe('log page — review loop', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows a mark-reviewed control on a pending (unreviewed + hard) entry', () => {
    useLogStore().entries = [entry({ id: 1, feedback: 'hard', reviewState: 'unreviewed' })]
    const w = mount(LogPage)
    expect(w.find('[data-test="mark-reviewed"]').exists()).toBe(true)
  })

  it('does not show it on an easy, unnoted entry (not pending)', () => {
    useLogStore().entries = [entry({ id: 2, feedback: 'easy', errorNote: null, reviewState: 'unreviewed' })]
    const w = mount(LogPage)
    expect(w.find('[data-test="mark-reviewed"]').exists()).toBe(false)
  })

  it('does not show it once the entry is reviewed, and shows a reviewed badge instead', () => {
    useLogStore().entries = [entry({ id: 3, feedback: 'hard', reviewState: 'correct' })]
    const w = mount(LogPage)
    expect(w.find('[data-test="mark-reviewed"]').exists()).toBe(false)
    expect(w.find('[data-test="reviewed-badge"]').exists()).toBe(true)
  })

  it('marks the entry reviewed when clicked and removes the control', async () => {
    const store = useLogStore()
    store.entries = [entry({ id: 4, feedback: 'hard', reviewState: 'unreviewed' })]
    const w = mount(LogPage)
    await w.find('[data-test="mark-reviewed"]').trigger('click')
    expect(store.entries[0]!.reviewState).toBe('correct')
    expect(w.find('[data-test="mark-reviewed"]').exists()).toBe(false)
  })

  it('surfaces the error note on a pending entry that has one', () => {
    useLogStore().entries = [
      entry({ id: 5, feedback: 'easy', errorNote: 'mixed up 이/가', reviewState: 'unreviewed' }),
    ]
    const w = mount(LogPage)
    expect(w.find('[data-test="mark-reviewed"]').exists()).toBe(true)
    expect(w.text()).toContain('mixed up 이/가')
  })
})
