import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PathCard from '~/components/paths/PathCard.vue'
import type { PathProgress } from '~/lib/paths/progress'

const stubs = { NuxtLink: { template: '<a><slot /></a>' } }

const progress = (over: Partial<PathProgress> = {}): PathProgress => ({
  items: [{ ko: 'A', learned: true }, { ko: 'B', learned: false }],
  total: 2, learned: 1, pct: 0.5, nextKo: 'B', ...over,
})

describe('PathCard', () => {
  it('shows a progressbar at the right percent and a next CTA deep-linking to ruleta focus', () => {
    const w = mount(PathCard, { props: { name: 'TOPIK 1', progress: progress() }, global: { stubs } })
    expect(w.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('50')
    expect(w.get('[data-testid="path-next"]').attributes('to')).toBe('/practice/ruleta?focus=B')
    expect(w.findAll('.path-card__item')).toHaveLength(2)
  })
  it('shows the complete state and no CTA when nextKo is null', () => {
    const w = mount(PathCard, {
      props: { name: 'TOPIK 1', progress: progress({ items: [{ ko: 'A', learned: true }], total: 1, learned: 1, pct: 1, nextKo: null }) },
      global: { stubs },
    })
    expect(w.find('[data-testid="path-next"]').exists()).toBe(false)
    expect(w.find('[data-testid="path-complete"]').exists()).toBe(true)
  })
})
