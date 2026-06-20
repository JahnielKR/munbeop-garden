import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomDeckShelf from '~/components/games/ruleta/CustomDeckShelf.vue'
import type { CustomDeckOption } from '~/components/games/ruleta/cards'

function opt(over: Partial<CustomDeckOption>): CustomDeckOption {
  return { id: 'c1', name: 'My deck', colors: ['var(--red)'], count: 6, disabled: false, reason: null, icon: 'deck-star', ...over }
}

describe('CustomDeckShelf', () => {
  it('renders the empty state with a create button when there are no decks', () => {
    const w = mount(CustomDeckShelf, { props: { options: [] } })
    expect(w.find('[data-testid="custom-deck-shelf"]').exists()).toBe(true)
    expect(w.find('[data-testid="custom-deck-create"]').exists()).toBe(true)
  })

  it('emits select with the deck id when a playable mat is clicked', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [opt({ id: 'abc' })] } })
    await w.find('[data-testid="custom-deck-abc"]').trigger('click')
    expect(w.emitted('select')).toEqual([['abc']])
  })

  it('does not emit select for a locked (<6) mat', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [opt({ id: 'x', count: 4, disabled: true, reason: 'too_few' })] } })
    await w.find('[data-testid="custom-deck-x"]').trigger('click')
    expect(w.emitted('select')).toBeUndefined()
  })

  it('emits edit (not select) when the pencil is clicked', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [opt({ id: 'abc' })] } })
    await w.find('[data-testid="custom-deck-edit-abc"]').trigger('click')
    expect(w.emitted('edit')).toEqual([['abc']])
    expect(w.emitted('select')).toBeUndefined()
  })

  it('emits create from the trailing add tile when decks exist', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [opt({})] } })
    await w.find('[data-testid="custom-deck-create"]').trigger('click')
    expect(w.emitted('create')).toHaveLength(1)
  })

  it('emits create from the empty-state button', async () => {
    const w = mount(CustomDeckShelf, { props: { options: [] } })
    await w.find('[data-testid="custom-deck-create"]').trigger('click')
    expect(w.emitted('create')).toHaveLength(1)
  })
})
