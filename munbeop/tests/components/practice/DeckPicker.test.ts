import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeckPicker from '~/components/games/ruleta/DeckPicker.vue'
import type { DeckOption } from '~/components/games/ruleta/cards'

const OPTIONS: DeckOption[] = [
  {
    id: null,
    name: 'All levels',
    colors: ['var(--sky)', 'var(--jade)', 'var(--gold)'],
    count: 10,
    disabled: false,
    reason: null,
  },
  {
    id: 'topik-1',
    name: 'TOPIK 1',
    colors: ['var(--sky)'],
    count: 6,
    disabled: false,
    reason: null,
  },
  {
    id: 'topik-2',
    name: 'TOPIK 2',
    colors: ['var(--jade)'],
    count: 4,
    disabled: true,
    reason: 'excluded',
  },
]

describe('DeckPicker', () => {
  it('renders one mat per option', () => {
    const w = mount(DeckPicker, { props: { options: OPTIONS } })
    expect(w.get('[data-testid="deck-all"]').text()).toContain('All levels')
    expect(w.get('[data-testid="deck-topik-1"]').text()).toContain('TOPIK 1')
    expect(w.get('[data-testid="deck-topik-1"]').text()).toContain('practice.deck_count 6')
  })

  it('emits select(null) for the all mat and select(id) for a deck', async () => {
    const w = mount(DeckPicker, { props: { options: OPTIONS } })
    await w.get('[data-testid="deck-all"]').trigger('click')
    await w.get('[data-testid="deck-topik-1"]').trigger('click')
    expect(w.emitted('select')).toEqual([[null], ['topik-1']])
  })

  it('locks disabled decks and shows the reason', async () => {
    const w = mount(DeckPicker, { props: { options: OPTIONS } })
    const locked = w.get('[data-testid="deck-topik-2"]')
    expect(locked.attributes('disabled')).toBeDefined()
    expect(locked.text()).toContain('practice.deck_excluded')
    await locked.trigger('click')
    expect(w.emitted('select')).toBeUndefined()
  })

  it('marks the recommended deck with a "your level" badge', () => {
    const w = mount(DeckPicker, { props: { options: OPTIONS, recommendedId: 'topik-1' } })
    expect(w.get('[data-testid="deck-topik-1"]').text()).toContain('practice.your_level')
    expect(w.get('[data-testid="deck-all"]').text()).not.toContain('practice.your_level')
  })
})
