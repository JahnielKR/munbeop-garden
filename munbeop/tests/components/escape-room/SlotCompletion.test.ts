import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SlotCompletion from '~/components/escape-room/SlotCompletion.vue'
import type { CompletionCandidate } from '~/lib/domain'

const ls = (s: string) => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const candidate: CompletionCandidate = {
  korean: '시계___ 벽에 있어요.',
  translation: ls('El reloj está en la pared.'),
  answer: '가',
  hints: { free: ls('free hint'), premium: ls('premium hint') },
}

describe('SlotCompletion', () => {
  it('renders the Korean line with the blank and the translation', () => {
    const w = mount(SlotCompletion, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    expect(w.get('[data-testid="slot-korean"]').text()).toContain('시계')
    expect(w.get('[data-testid="slot-translation"]').text()).toContain('reloj')
  })

  it('submits the trimmed input via the check button', async () => {
    const w = mount(SlotCompletion, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    await w.get('[data-testid="slot-input"]').setValue('  가  ')
    await w.get('[data-testid="slot-check"]').trigger('click')
    expect(w.emitted('answer')).toEqual([['가']])
  })

  it('submits on Enter inside the input', async () => {
    const w = mount(SlotCompletion, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    await w.get('[data-testid="slot-input"]').setValue('이')
    await w.get('[data-testid="slot-input"]').trigger('keydown.enter')
    expect(w.emitted('answer')).toEqual([['이']])
  })

  it('does not emit when the input is empty', async () => {
    const w = mount(SlotCompletion, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    await w.get('[data-testid="slot-check"]').trigger('click')
    expect(w.emitted('answer')).toBeFalsy()
  })

  it('forwards hint events', async () => {
    const w = mount(SlotCompletion, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    await w.get('[data-testid="hint-free-btn"]').trigger('click')
    expect(w.emitted('use-free-hint')).toBeTruthy()
  })
})
