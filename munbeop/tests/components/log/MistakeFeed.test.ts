import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MistakeFeed from '~/components/log/MistakeFeed.vue'
import type { LogEntry } from '~/lib/domain'

const e = (over: Partial<LogEntry> = {}): LogEntry => ({
  id: Math.random(),
  ko: 'A',
  sentence: 's',
  feedback: 'hard',
  errorNote: null,
  errorDimension: null,
  reviewState: 'unreviewed',
  contextId: 'banmal',
  contextName: '반말',
  date: '2026-06-20T00:00:00Z',
  ...over,
})

describe('MistakeFeed', () => {
  it('renders a group per pending ko with a focus-practice link', () => {
    const w = mount(MistakeFeed, {
      props: { entries: [e({ ko: 'A' }), e({ ko: 'A' }), e({ ko: 'B', feedback: 'easy' })] },
    })
    const links = w.findAll('a')
    expect(links.some((a) => a.attributes('href') === '/practice/ruleta?focus=A')).toBe(true)
    // 'B' is easy/no-note → not pending → no group
    expect(links.some((a) => a.attributes('href') === '/practice/ruleta?focus=B')).toBe(false)
  })
  it('renders nothing when there are no pending entries', () => {
    const w = mount(MistakeFeed, { props: { entries: [e({ feedback: 'easy' })] } })
    expect(w.find('[data-testid="mistake-feed"]').exists()).toBe(false)
  })
})
