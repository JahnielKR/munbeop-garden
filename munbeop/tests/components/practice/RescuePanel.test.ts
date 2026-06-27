import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RescuePanel from '~/components/practice/RescuePanel.vue'
import type { Grammar, LocalizedString } from '~/lib/domain'

// Usage notes come from the static seed by ko; mock so the reread stage has one.
vi.mock('~/lib/usage-notes', () => ({
  notesFor: () => ({
    en: 'use it for setup', es: 'use it for setup', fr: 'use it for setup',
    'pt-BR': 'use it for setup', th: 'use it for setup', id: 'use it for setup',
    vi: 'use it for setup', ja: 'use it for setup',
  }),
}))

const L = (s: string): LocalizedString => ({
  en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s,
})
const grammar: Grammar = { ko: '-는데', meaning: L('contrast/background'), deckId: 'topik-2' }

const stubs = {
  ExamplesSection: { template: '<div data-testid="examples-stub" />' },
  ConfusedWithSection: { template: '<div data-testid="confused-stub" />' },
}
const mountStage = (stage: string, extra: Record<string, unknown> = {}) =>
  mount(RescuePanel, {
    props: { grammar, stage, dominantDimension: null, isLast: false, canBack: false, ...extra },
    global: { stubs },
  })

describe('RescuePanel', () => {
  it('reread stage shows the meaning and usage notes, not the sub-sections', () => {
    const w = mountStage('reread')
    expect(w.text()).toContain('contrast/background')
    expect(w.text()).toContain('use it for setup')
    expect(w.find('[data-testid="examples-stub"]').exists()).toBe(false)
    expect(w.find('[data-testid="confused-stub"]').exists()).toBe(false)
  })

  it('examples stage renders ExamplesSection', () => {
    const w = mountStage('examples')
    expect(w.find('[data-testid="examples-stub"]').exists()).toBe(true)
  })

  it('discriminate stage renders ConfusedWithSection', () => {
    const w = mountStage('discriminate')
    expect(w.find('[data-testid="confused-stub"]').exists()).toBe(true)
  })

  it('produce stage emits produce when the CTA is clicked', async () => {
    const w = mountStage('produce', { isLast: true })
    await w.find('[data-testid="rescue-produce"]').trigger('click')
    expect(w.emitted('produce')).toHaveLength(1)
  })

  it('emits next on the Next control when not on the produce stage', async () => {
    const w = mountStage('examples')
    await w.find('[data-testid="rescue-next"]').trigger('click')
    expect(w.emitted('next')).toHaveLength(1)
  })

  it('shows the dominant-dimension header when one is set', () => {
    const w = mountStage('reread', { dominantDimension: 'particle' })
    // i18n stub echoes keys; header key + interpolated dimension label.
    expect(w.text()).toContain('rescue.header')
    expect(w.text()).toContain('dimension.particle')
  })
})
