import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LogEntryRow from '~/components/log/LogEntryRow.vue'
import type { LogEntry } from '~/lib/domain'

const entry = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: 7,
  ko: '-아/어서',
  sentence: '주말에 만나서 좋았어',
  feedback: 'hard',
  errorNote: null,
  errorDimension: 'particle',
  reviewState: 'unreviewed',
  contextId: 'banmal',
  contextName: '반말',
  date: '2026-06-20T00:00:00Z',
  ...over,
})

describe('LogEntryRow', () => {
  it('shows the dimension chip when set and emits review on mark-reviewed', async () => {
    const w = mount(LogEntryRow, { props: { entry: entry() } })
    expect(w.text()).toContain('dimension.particle') // key-echo stub
    await w.find('[data-testid="mark-reviewed"]').trigger('click')
    expect(w.emitted('review')?.[0]?.[0]).toBe(7)
  })
  it('shows the reviewed badge instead of the button once reviewed', () => {
    const w = mount(LogEntryRow, { props: { entry: entry({ reviewState: 'correct' }) } })
    expect(w.find('[data-testid="mark-reviewed"]').exists()).toBe(false)
    expect(w.find('[data-testid="reviewed-badge"]').exists()).toBe(true)
  })
  it('emits delete with the entry id when the delete control is clicked', async () => {
    const w = mount(LogEntryRow, { props: { entry: entry() } })
    await w.find('[data-testid="delete-entry"]').trigger('click')
    expect(w.emitted('delete')?.[0]?.[0]).toBe(7)
  })
})
