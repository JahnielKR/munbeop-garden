import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RescueOfferBanner from '~/components/practice/RescueOfferBanner.vue'

describe('RescueOfferBanner', () => {
  it('links to the rescue route for the given ko', () => {
    const w = mount(RescueOfferBanner, { props: { ko: '-는데' } })
    const link = w.find('a')
    expect(link.attributes('href')).toBe('/practice/rescue?ko=' + encodeURIComponent('-는데'))
  })

  it('emits dismiss when the dismiss control is clicked', async () => {
    const w = mount(RescueOfferBanner, { props: { ko: 'A' } })
    await w.find('[data-testid="rescue-offer-dismiss"]').trigger('click')
    expect(w.emitted('dismiss')).toHaveLength(1)
  })
})
