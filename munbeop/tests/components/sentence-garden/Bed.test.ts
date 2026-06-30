import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Bed from '~/components/sentence-garden/Bed.vue'

describe('Bed', () => {
  it('shows total slots and emits remove when a filled slot is clicked', async () => {
    const placed = [{ id: 0, text: '저는' }]
    const w = mount(Bed, { props: { placed, total: 3, verdict: null, label: 'Your sentence' } })
    expect(w.findAll('.sg-bed__slot')).toHaveLength(3)
    await w.find('.sg-bed__slot--filled').trigger('click')
    expect(w.emitted('remove')![0]).toEqual([0])
  })
})
