import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HintPanel from '~/components/escape-room/HintPanel.vue'
import type { Hints } from '~/lib/domain'

const ls = (s: string) => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})

const hints: Hints = { free: ls('vocab hint'), premium: ls('rule hint') }

describe('HintPanel', () => {
  it('renders both pista buttons when no flag is set', () => {
    const w = mount(HintPanel, {
      props: { hints, flags: { free: false, premium: false } },
    })
    expect(w.find('[data-testid="hint-free-btn"]').exists()).toBe(true)
    expect(w.find('[data-testid="hint-premium-btn"]').exists()).toBe(true)
    expect(w.find('[data-testid="hint-free-text"]').exists()).toBe(false)
  })

  it('emits "use-free" when the free pista button is clicked', async () => {
    const w = mount(HintPanel, {
      props: { hints, flags: { free: false, premium: false } },
    })
    await w.get('[data-testid="hint-free-btn"]').trigger('click')
    expect(w.emitted('use-free')).toBeTruthy()
  })

  it('emits "use-premium" when the premium pista button is clicked', async () => {
    const w = mount(HintPanel, {
      props: { hints, flags: { free: false, premium: false } },
    })
    await w.get('[data-testid="hint-premium-btn"]').trigger('click')
    expect(w.emitted('use-premium')).toBeTruthy()
  })

  it('reveals free hint text and hides its button once flags.free is true', () => {
    const w = mount(HintPanel, {
      props: { hints, flags: { free: true, premium: false } },
    })
    expect(w.find('[data-testid="hint-free-btn"]').exists()).toBe(false)
    expect(w.get('[data-testid="hint-free-text"]').text()).toContain('vocab hint')
  })

  it('reveals premium hint text once flags.premium is true', () => {
    const w = mount(HintPanel, {
      props: { hints, flags: { free: false, premium: true } },
    })
    expect(w.find('[data-testid="hint-premium-btn"]').exists()).toBe(false)
    expect(w.get('[data-testid="hint-premium-text"]').text()).toContain('rule hint')
  })
})
