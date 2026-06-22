// tests/components/register-drill/RegisterCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterCard from '~/components/register-drill/RegisterCard.vue'
import type { RegisterItem } from '~/lib/domain'

const item: RegisterItem = {
  source: '저는 학생이에요.', mode: 'level', target: 'formal', set: 'formal',
  answer: '저는 학생입니다.', distractors: ['저는 학생이야.', '나는 학생입니다.', '저는 학생이세요.'],
  trans: { en: 'I am a student.' } as never,
  why: { en: '합쇼체 is -ㅂ니다.' } as never,
}
const options = ['저는 학생입니다.', '저는 학생이야.', '나는 학생입니다.', '저는 학생이세요.']

function factory(phase = 'question', picked: string | null = null) {
  return mount(RegisterCard, {
    props: {
      item, options, phase,
      verdict: phase === 'wrong' ? false : phase === 'right' ? true : null,
      picked,
    },
    global: { mocks: { $t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k) } },
  })
}

describe('RegisterCard', () => {
  it('renders the source and one button per option', () => {
    const w = factory()
    expect(w.text()).toContain('저는 학생이에요.')
    expect(w.findAll('[data-testid^="register-option-"]')).toHaveLength(4)
  })
  it('emits answer with the chosen option', async () => {
    const w = factory()
    await w.find('[data-testid="register-option-0"]').trigger('click')
    expect(w.emitted('answer')?.[0]?.[0]).toBe(options[0])
  })
  it('on wrong, reveals the correct answer and the why note', () => {
    const w = factory('wrong', '저는 학생이야.')
    expect(w.text()).toContain('register.reveal_correct')
    expect(w.text()).toContain('합쇼체 is -ㅂ니다.')
  })
})
