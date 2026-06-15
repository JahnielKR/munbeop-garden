import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import Premios from '~/components/layout/Premios.vue'
import { useEscapeRoomStore } from '~/stores/escape-room'

describe('Premios', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders 4 locked tier slots + an n/total counter when nothing is unlocked', () => {
    const w = mount(Premios, { props: { variant: 'strip' } })
    expect(w.findAll('.premio--locked')).toHaveLength(4)
    expect(w.findAll('.premio--unlocked')).toHaveLength(0)
    // 2 playable levels × 4 tiers = 8 total today.
    expect(w.get('.premios__count').text()).toMatch(/^0\/\d+$/)
  })

  it('flips the matching tier slot to unlocked and increments the count', () => {
    useEscapeRoomStore().unlockedCosmetics = ['cosmetic-frame-apron'] // level-01 rare
    const w = mount(Premios, { props: { variant: 'strip' } })
    expect(w.get('.premio--rare').classes()).toContain('premio--unlocked')
    expect(w.findAll('.premio--unlocked')).toHaveLength(1)
    expect(w.get('.premios__count').text()).toMatch(/^1\/\d+$/)
  })

  it('builds the cosmetic URL with a single cosmetics/ segment (no double prefix)', () => {
    useEscapeRoomStore().unlockedCosmetics = ['cosmetic-frame-apron']
    const w = mount(Premios, { props: { variant: 'strip' } })
    const src = w.get('.premio--rare .premio__icon').attributes('src')
    expect(src).toBe('/escape-room/level-01/cosmetics/cosmetic-frame-apron.png')
    expect(src!.match(/cosmetics\//g)).toHaveLength(1)
  })

  it('renders nothing for the strip variant when collapsed', () => {
    const w = mount(Premios, { props: { variant: 'strip', collapsed: true } })
    expect(w.find('.premios').exists()).toBe(false)
  })

  it('shows the empty line in the detail view only while nothing is unlocked', () => {
    const empty = mount(Premios, { props: { variant: 'detail' } })
    expect(empty.find('.premios__empty').exists()).toBe(true)

    setActivePinia(createPinia())
    useEscapeRoomStore().unlockedCosmetics = ['cosmetic-frame-apron']
    const filled = mount(Premios, { props: { variant: 'detail' } })
    expect(filled.find('.premios__empty').exists()).toBe(false)
  })
})
