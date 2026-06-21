import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressDots from '~/components/practice/ProgressDots.vue'

describe('ProgressDots a11y', () => {
  it('exposes aria-valuemin and an optional label', () => {
    const w = mount(ProgressDots, { props: { total: 5, progress: 2, label: 'Progress' } })
    const bar = w.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuemin')).toBe('0')
    expect(bar.attributes('aria-valuenow')).toBe('2')
    expect(bar.attributes('aria-valuemax')).toBe('5')
    expect(bar.attributes('aria-label')).toBe('Progress')
  })
})
