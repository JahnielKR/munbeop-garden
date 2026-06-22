import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfusedWithSection from '~/components/library/GrammarStudySheet/ConfusedWithSection.vue'

const pair = {
  id: 'an-mot',
  a: '안 + V / -지 않다',
  b: '못 + V / -지 못하다',
  note: { en: 'choice vs ability' },
  items: [
    { sentence: '{} 먹어요.', optionA: '안', optionB: '못', answer: 'a', trans: { en: 'x' }, why: { en: 'y' } },
  ],
}
vi.mock('~/lib/grammar-pairs', () => ({
  pairsFor: (ko: string) =>
    ko === '안 + V / -지 않다' ? [{ pair, selfSide: 'a', otherKo: '못 + V / -지 못하다' }] : [],
}))

const factory = (ko: string) =>
  mount(ConfusedWithSection, {
    props: { grammar: { ko } },
    global: { mocks: { $t: (k: string) => k }, stubs: { PairDrill: true } },
  })

describe('ConfusedWithSection', () => {
  it('shows the other ko chip + note for a point in a pair', () => {
    const w = factory('안 + V / -지 않다')
    expect(w.text()).toContain('못 + V / -지 못하다')
    expect(w.text()).toContain('choice vs ability')
  })
  it('renders nothing for a point in no pair', () => {
    const w = factory('-네요')
    expect(w.find('.confused-section').exists()).toBe(false)
  })
  it('toggles the drill open', async () => {
    const w = factory('안 + V / -지 않다')
    expect(w.findComponent({ name: 'PairDrill' }).exists()).toBe(false)
    await w.find('[data-testid="confused-test-an-mot"]').trigger('click')
    expect(w.findComponent({ name: 'PairDrill' }).exists()).toBe(true)
  })
})
