import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DataErrorBanner from '~/components/layout/DataErrorBanner.vue'
import { useAppStatus } from '~/stores/appStatus'

describe('DataErrorBanner', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders nothing while data is loading or ready', () => {
    const s = useAppStatus()
    s.status = 'ready'
    const w = mount(DataErrorBanner)
    expect(w.find('[data-test="data-error"]').exists()).toBe(false)
  })

  it('shows the banner when the data status is error', () => {
    const s = useAppStatus()
    s.status = 'error'
    const w = mount(DataErrorBanner)
    expect(w.find('[data-test="data-error"]').exists()).toBe(true)
  })

  it('calls retry when the retry button is clicked', async () => {
    const s = useAppStatus()
    s.status = 'error'
    const retry = vi.spyOn(s, 'retry').mockResolvedValue()
    const w = mount(DataErrorBanner)
    await w.find('[data-test="data-retry"]').trigger('click')
    expect(retry).toHaveBeenCalled()
  })
})
