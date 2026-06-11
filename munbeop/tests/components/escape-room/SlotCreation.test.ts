import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SlotCreation from '~/components/escape-room/SlotCreation.vue'
import type { CreationCandidate } from '~/lib/domain'

const ls = (s: string) => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const candidate: CreationCandidate = {
  korean: '어디에 가요?',
  question: ls('¿A dónde vas?'),
  tiles: ['카페에', '가요', '학교에서'],
  correctOrder: [0, 1],
  hints: { free: ls('free hint'), premium: ls('premium hint') },
}

describe('SlotCreation', () => {
  it('renders the question and one button per tile', () => {
    const w = mount(SlotCreation, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    expect(w.get('[data-testid="slot-korean"]').text()).toContain('어디에 가요?')
    expect(w.findAll('[data-testid="slot-tile"]')).toHaveLength(3)
  })

  it('tapping tiles builds the sentence in order', async () => {
    const w = mount(SlotCreation, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    const tiles = w.findAll('[data-testid="slot-tile"]')
    await tiles[0]!.trigger('click')
    await tiles[1]!.trigger('click')
    const chips = w.findAll('[data-testid="slot-built-chip"]')
    expect(chips.map((c) => c.text())).toEqual(['카페에', '가요'])
  })

  it('a used tile is disabled; tapping a built chip removes it', async () => {
    const w = mount(SlotCreation, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    const tiles = w.findAll('[data-testid="slot-tile"]')
    await tiles[0]!.trigger('click')
    expect(tiles[0]!.attributes('disabled')).toBeDefined()
    await w.get('[data-testid="slot-built-chip"]').trigger('click')
    expect(w.findAll('[data-testid="slot-built-chip"]')).toHaveLength(0)
  })

  it('check emits the picked indices in order', async () => {
    const w = mount(SlotCreation, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    const tiles = w.findAll('[data-testid="slot-tile"]')
    await tiles[2]!.trigger('click')
    await tiles[1]!.trigger('click')
    await w.get('[data-testid="slot-check"]').trigger('click')
    expect(w.emitted('answer')).toEqual([[[2, 1]]])
  })

  it('clear resets the built sentence', async () => {
    const w = mount(SlotCreation, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    await w.findAll('[data-testid="slot-tile"]')[0]!.trigger('click')
    await w.get('[data-testid="slot-clear"]').trigger('click')
    expect(w.findAll('[data-testid="slot-built-chip"]')).toHaveLength(0)
  })

  it('does not emit when nothing is built', async () => {
    const w = mount(SlotCreation, {
      props: { candidate, flags: { free: false, premium: false } },
    })
    await w.get('[data-testid="slot-check"]').trigger('click')
    expect(w.emitted('answer')).toBeFalsy()
  })
})
