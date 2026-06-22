import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReadyToRevisit from '~/components/garden/ReadyToRevisit.vue'

describe('ReadyToRevisit', () => {
  it('links to the revisit-due session and shows the count', () => {
    const w = mount(ReadyToRevisit, { props: { count: 3, hasMore: false } })
    const link = w.find('a')
    expect(link.attributes('href')).toBe('/practice/ruleta?revisit=due')
    expect(w.text()).toContain('3')
  })

  it('appends + to the count when there are more than the cap', () => {
    const w = mount(ReadyToRevisit, { props: { count: 9, hasMore: true } })
    expect(w.text()).toContain('9+')
  })
})
