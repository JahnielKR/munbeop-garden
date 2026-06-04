import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import WelcomeBrandMark from '~/components/welcome/WelcomeBrandMark.vue'

function stubMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((q: string) => ({
      matches: q.includes('reduce') ? reducedMotion : false,
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('WelcomeBrandMark', () => {
  beforeEach(() => { vi.useFakeTimers(); stubMatchMedia(false) })
  afterEach(() => { vi.useRealTimers() })

  it('renders three stacked layers of the heading', () => {
    const wrapper = mount(WelcomeBrandMark)
    expect(wrapper.findAll('.brand__title-layer').length).toBe(3)
  })

  it('mouseenter on the heading sets is-glitching for 250 ms', async () => {
    const wrapper = mount(WelcomeBrandMark)
    const h1 = wrapper.get('.brand__title')
    expect(h1.classes()).not.toContain('is-glitching')
    await h1.trigger('mouseenter')
    expect(h1.classes()).toContain('is-glitching')
    vi.advanceTimersByTime(250)
    await flushPromises()
    expect(h1.classes()).not.toContain('is-glitching')
  })

  it('back-to-back mouseenter while glitching does not extend or restart the cycle', async () => {
    const wrapper = mount(WelcomeBrandMark)
    const h1 = wrapper.get('.brand__title')
    await h1.trigger('mouseenter')
    vi.advanceTimersByTime(100)
    await h1.trigger('mouseenter')
    vi.advanceTimersByTime(150)
    await flushPromises()
    expect(h1.classes()).not.toContain('is-glitching')
  })

  it('prefers-reduced-motion blocks the glitch', async () => {
    stubMatchMedia(true)
    const wrapper = mount(WelcomeBrandMark)
    const h1 = wrapper.get('.brand__title')
    await h1.trigger('mouseenter')
    expect(h1.classes()).not.toContain('is-glitching')
  })
})
