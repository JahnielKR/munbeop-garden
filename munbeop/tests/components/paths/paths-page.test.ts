import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import PathsPage from '~/pages/paths.vue'
import { useGrammarStore } from '~/stores/grammar'

vi.stubGlobal('definePageMeta', () => {})

describe('paths page states', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows a skeleton while the catalog is loading', () => {
    const grammar = useGrammarStore()
    vi.spyOn(grammar, 'hydrate').mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(PathsPage, {
      global: { stubs: { BilingualTitle: true, PathCard: true } },
    })

    expect(wrapper.find('[data-test="paths-loading"]').exists()).toBe(true)
  })

  it('shows a retryable error when catalog hydration fails', async () => {
    const grammar = useGrammarStore()
    vi.spyOn(grammar, 'hydrate').mockRejectedValue(new Error('offline'))

    const wrapper = mount(PathsPage, {
      global: { stubs: { BilingualTitle: true, PathCard: true } },
    })
    await flushPromises()

    expect(wrapper.find('[data-test="paths-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="paths-retry"]').exists()).toBe(true)
  })

  it('shows an explicit empty state after a successful empty load', async () => {
    const grammar = useGrammarStore()
    vi.spyOn(grammar, 'hydrate').mockResolvedValue()

    const wrapper = mount(PathsPage, {
      global: { stubs: { BilingualTitle: true, PathCard: true } },
    })
    await flushPromises()

    expect(wrapper.find('[data-test="paths-empty"]').exists()).toBe(true)
  })
})
