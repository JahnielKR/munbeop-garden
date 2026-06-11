import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameCard from '~/components/games/GameCard.vue'

/**
 * Regression: GameCard once rendered `<component :is="'NuxtLink'">` — a STRING.
 * Nuxt auto-imports components at compile time and does not register them
 * globally, so the string resolved to an unknown `<nuxtlink>` element and
 * clicking a card did nothing in the real app (tests passed because they
 * stubbed NuxtLink by name). These tests mount WITHOUT stubs on purpose:
 * an unlocked card must render a real anchor with an href.
 */

const base = {
  to: '/escape-room',
  name: 'Escape Room',
  description: 'desc',
}

describe('GameCard', () => {
  it('unlocked: renders a real <a> with the target href (no stubs)', () => {
    const w = mount(GameCard, { props: base })
    const a = w.find('a')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toBe('/escape-room')
  })

  it('locked: renders a <div>, no anchor, with the ribbon', () => {
    const w = mount(GameCard, {
      props: { ...base, locked: true, lockedLabel: 'SOON' },
    })
    expect(w.find('a').exists()).toBe(false)
    expect(w.text()).toContain('SOON')
  })

  it('shows the image cover when given, emoji otherwise', () => {
    const withImg = mount(GameCard, { props: { ...base, image: '/x.png' } })
    expect(withImg.find('img').attributes('src')).toBe('/x.png')
    const withEmoji = mount(GameCard, { props: { ...base, emoji: '🎲' } })
    expect(withEmoji.text()).toContain('🎲')
  })
})
