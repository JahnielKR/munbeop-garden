import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutSection from '~/components/settings/AboutSection.vue'

describe('AboutSection', () => {
  it('links to policies, pricing, features and a contact mailto', () => {
    const wrapper = mount(AboutSection)
    expect(wrapper.find('a[href="/policies"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/pricing"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/features"]').exists()).toBe(true)
    expect(wrapper.find('a[href="mailto:hello@mungarden.app"]').exists()).toBe(true)
  })
})
