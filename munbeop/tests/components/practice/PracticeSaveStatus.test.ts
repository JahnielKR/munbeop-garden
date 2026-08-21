import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PracticeSaveStatus from '~/components/practice/PracticeSaveStatus.vue'

describe('PracticeSaveStatus', () => {
  it('offers an explicit retry after a failed write', async () => {
    const wrapper = mount(PracticeSaveStatus, {
      props: { status: 'error' },
      global: { mocks: { $t: (key: string) => key } },
    })
    expect(wrapper.text()).toContain('practice.save_error')
    await wrapper.get('[data-testid="practice-save-retry"]').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('does not render for idle state', () => {
    const wrapper = mount(PracticeSaveStatus, { props: { status: 'idle' } })
    expect(wrapper.find('[data-testid="practice-save-status"]').exists()).toBe(false)
  })
})
