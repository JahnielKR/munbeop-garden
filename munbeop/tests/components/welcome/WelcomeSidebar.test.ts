import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomeSidebar from '~/components/welcome/WelcomeSidebar.vue'

function makeStubs() {
  return {
    'i18n-t': { template: '<span><slot /></span>' },
  }
}

const i18nMocks = { $t: (k: string) => k }

describe('WelcomeSidebar', () => {
  it('emits close when the close button is clicked', async () => {
    const wrapper = mount(WelcomeSidebar, {
      props: { open: true, titleId: 't1' },
      global: { mocks: i18nMocks, stubs: makeStubs() },
      slots: { default: '<div data-testid="content">CONTENT</div>' },
    })
    await wrapper.get('[data-testid="welcome-sidebar-close"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close on Escape keydown when open', async () => {
    const wrapper = mount(WelcomeSidebar, {
      props: { open: true, titleId: 't1' },
      global: { mocks: i18nMocks, stubs: makeStubs() },
      slots: { default: '<button>x</button>' },
    })
    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit close on Escape when closed', async () => {
    const wrapper = mount(WelcomeSidebar, {
      props: { open: false, titleId: 't1' },
      global: { mocks: i18nMocks, stubs: makeStubs() },
      slots: { default: '<button>x</button>' },
    })
    await wrapper.trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('renders the slot content', () => {
    const wrapper = mount(WelcomeSidebar, {
      props: { open: true, titleId: 't1' },
      global: { mocks: i18nMocks, stubs: makeStubs() },
      slots: { default: '<div data-testid="content">CONTENT</div>' },
    })
    expect(wrapper.get('[data-testid="content"]').text()).toBe('CONTENT')
  })
})
