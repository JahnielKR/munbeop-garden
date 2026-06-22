import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StrugglingPlants from '~/components/stats/StrugglingPlants.vue'
import type { Leech } from '~/lib/srs'
import type { LocalizedString } from '~/lib/domain'

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})
const leech = (over: Partial<Leech> = {}): Leech => ({
  ko: '-는데',
  meaning: L('contrast'),
  recentHardRatio: 0.6,
  recentReviews: 5,
  dominantDimension: null,
  ...over,
})

describe('StrugglingPlants', () => {
  it('renders a Care link to the rescue route per leech', () => {
    const w = mount(StrugglingPlants, { props: { leeches: [leech({ ko: 'A' }), leech({ ko: 'B' })] } })
    const hrefs = w.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toContain('/practice/rescue?ko=A')
    expect(hrefs).toContain('/practice/rescue?ko=B')
  })

  it('shows the dominant-dimension chip when set', () => {
    const w = mount(StrugglingPlants, { props: { leeches: [leech({ dominantDimension: 'register' })] } })
    expect(w.text()).toContain('dimension.register') // i18n stub echoes the key
  })

  it('renders nothing when there are no leeches', () => {
    const w = mount(StrugglingPlants, { props: { leeches: [] } })
    expect(w.find('[data-testid="struggling-plants"]').exists()).toBe(false)
  })
})
