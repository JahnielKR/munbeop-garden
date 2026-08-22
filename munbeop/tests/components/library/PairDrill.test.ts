import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PairDrill from '~/components/library/GrammarStudySheet/PairDrill.vue'

const recordActivity = vi.fn()
vi.mock('~/stores/activity', () => ({
  useActivityStore: () => ({ record: recordActivity }),
}))

const L1 = { en: 'because busy' }
const pair = {
  id: 'an-mot', a: '안 + V / -지 않다', b: '못 + V / -지 못하다', note: { en: 'x' },
  items: [
    { sentence: '점심을 {} 먹었어요.', optionA: '안', optionB: '못', answer: 'b', trans: L1, why: L1 },
    { sentence: '케이크를 {} 먹어요.', optionA: '안', optionB: '못', answer: 'a', trans: L1, why: L1 },
  ],
}
const factory = () =>
  mount(PairDrill, {
    props: { pair },
    global: { mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })

describe('PairDrill', () => {
  beforeEach(() => recordActivity.mockClear())

  it('renders the cloze sentence split on {} and two options', () => {
    const w = factory()
    expect(w.text()).toContain('점심을')
    expect(w.find('[data-testid="pair-opt-a"]').text()).toBe('안')
    expect(w.find('[data-testid="pair-opt-b"]').text()).toBe('못')
  })
  it('picking the wrong option reveals the why note', async () => {
    const w = factory()
    await w.find('[data-testid="pair-opt-a"]').trigger('click') // answer is 'b'
    expect(w.text()).toContain('library.confused.wrong')
    expect(w.text()).toContain('because busy')
    expect(recordActivity).toHaveBeenCalledTimes(1)
  })
  it('advances through items to a final score', async () => {
    const w = factory()
    await w.find('[data-testid="pair-opt-b"]').trigger('click') // item 1 correct
    await w.find('[data-testid="pair-next"]').trigger('click')
    await w.find('[data-testid="pair-opt-a"]').trigger('click') // item 2 correct
    await w.find('[data-testid="pair-next"]').trigger('click')
    expect(w.find('[data-testid="pair-restart"]').exists()).toBe(true)
    expect(w.text()).toContain('library.confused.score')
    expect(recordActivity).toHaveBeenCalledTimes(2)
  })
  it('records only the first committed pick for an item', async () => {
    const w = factory()
    await w.find('[data-testid="pair-opt-a"]').trigger('click')
    await w.find('[data-testid="pair-opt-b"]').trigger('click')
    expect(recordActivity).toHaveBeenCalledTimes(1)
  })
})
