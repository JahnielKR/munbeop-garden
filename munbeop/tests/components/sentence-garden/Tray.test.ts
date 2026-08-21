import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Tray from '~/components/sentence-garden/Tray.vue'

describe('Tray', () => {
  it('renders a button per card and emits place on click', async () => {
    const cards = [{ id: 0, text: '저는' }, { id: 1, text: '물을' }]
    const w = mount(Tray, { props: { cards, label: 'Word cards' } })
    const btns = w.findAll('.sg-tray__card')
    expect(btns).toHaveLength(2)
    await btns[1]!.trigger('click')
    expect(w.emitted('place')![0]).toEqual([cards[1]])
  })
})
