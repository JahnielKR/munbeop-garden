import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomeAuthOptions from '~/components/welcome/WelcomeAuthOptions.vue'

vi.stubGlobal('useAuth', () => ({
  signInWithProvider: vi.fn(async () => ({ error: null })),
}))

describe('WelcomeAuthOptions route mode', () => {
  it('opens the requested email form when the route mode arrives after mount', async () => {
    const wrapper = mount(WelcomeAuthOptions, {
      props: { initialEmailMode: null },
      global: {
        stubs: {
          WelcomeEmailForm: {
            props: ['mode'],
            template: '<div data-testid="email-form" :data-mode="mode" />',
          },
        },
      },
    })

    expect(wrapper.find('[data-testid="email-form"]').exists()).toBe(false)

    await wrapper.setProps({ initialEmailMode: 'signin' })

    expect(wrapper.get('[data-testid="email-form"]').attributes('data-mode')).toBe('signin')
  })
})
