// tests/components/cloze-drill/ClozeCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ClozeCard from '~/components/cloze-drill/ClozeCard.vue'
import type { ClozeItem } from '~/lib/domain'

const item: ClozeItem = {
  ko: '-고 싶다', sentence: '영화를 {} 싶어요.', answer: '보고',
  distractors: ['봐서', '보지만', '보면'],
  trans: { en: 'I want to watch a movie.' } as never,
  why: { en: 'Only -고 chains with 싶다.' } as never,
}
const options = ['보고', '봐서', '보지만', '보면']

function factory(phase = 'question', picked: string | null = null) {
  return mount(ClozeCard, {
    props: { item, options, phase, verdict: phase === 'wrong' ? false : phase === 'right' ? true : null, picked },
    global: { mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('ClozeCard', () => {
  it('renders the cloze split on {} and one button per option', () => {
    const w = factory()
    expect(w.text()).toContain('영화를')
    expect(w.text()).toContain('싶어요')
    expect(w.findAll('[data-testid^="cloze-option-"]')).toHaveLength(4)
  })
  it('emits answer with the chosen option', async () => {
    const w = factory()
    await w.find('[data-testid="cloze-option-0"]').trigger('click')
    expect(w.emitted('answer')?.[0]?.[0]).toBe(options[0])
  })
  it('on wrong, fills the blank with the correct answer and reveals why', () => {
    const w = factory('wrong', '봐서')
    expect(w.text()).toContain('보고')                 // blank filled with the correct form
    expect(w.text()).toContain('Only -고 chains with 싶다.')
  })
})
