import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import WelcomeDialog from '~/components/welcome/WelcomeDialog.vue'

describe('WelcomeDialog', () => {
  it('renders nothing when text is empty', () => {
    const wrapper = mount(WelcomeDialog, { props: { text: '', variant: 'normal' } })
    expect(wrapper.find('[data-testid="welcome-dialog-text"]').exists()).toBe(false)
  })

  it('renders typewriter text when text is non-empty', async () => {
    vi.useFakeTimers()
    const wrapper = mount(WelcomeDialog, { props: { text: 'abc', variant: 'normal' } })
    expect(wrapper.find('[data-testid="welcome-dialog-text"]').exists()).toBe(true)
    vi.advanceTimersByTime(200)
    await flushPromises()
    expect(wrapper.get('[data-testid="welcome-dialog-text"]').text()).toContain('abc')
    vi.useRealTimers()
  })

  it('emits dismiss on click and on Enter keydown', async () => {
    const wrapper = mount(WelcomeDialog, { props: { text: 'hi', variant: 'normal' } })
    // Skip the typewriter first (click while not done flushes the line).
    await wrapper.get('[data-testid="welcome-dialog-root"]').trigger('click')
    // Second click → actually emits dismiss.
    await wrapper.get('[data-testid="welcome-dialog-root"]').trigger('click')
    await wrapper.get('[data-testid="welcome-dialog-root"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('dismiss')).toBeTruthy()
    expect(wrapper.emitted('dismiss')!.length).toBe(2)
  })

  it('applies error styling when variant is error', () => {
    const wrapper = mount(WelcomeDialog, { props: { text: 'oops', variant: 'error' } })
    expect(wrapper.get('[data-testid="welcome-dialog-root"]').classes()).toContain('dialog--error')
  })
})
