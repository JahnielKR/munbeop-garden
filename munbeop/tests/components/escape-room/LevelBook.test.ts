import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LevelBook from '~/components/escape-room/LevelBook.vue'
import LevelPage from '~/components/escape-room/LevelPage.vue'
import { LEVEL_REGISTRY } from '~/seed/escape-room/registry'

const stubs = { NuxtLink: { template: '<a><slot /></a>' } }

describe('LevelPage', () => {
  const playable = LEVEL_REGISTRY[0]!
  const comingSoon = LEVEL_REGISTRY[1]!

  it('renders cover, title, tagline and TOPIK badge', () => {
    const w = mount(LevelPage, { props: { entry: playable }, global: { stubs } })
    expect(w.get('[data-testid="page-cover"]').attributes('src')).toBe(playable.cover)
    expect(w.get('[data-testid="page-title"]').text()).toContain('minbak')
    expect(w.get('[data-testid="page-tagline"]').text().length).toBeGreaterThan(20)
    expect(w.get('[data-testid="page-topik"]').text()).toContain('1')
  })

  it('shows 4 reward tiers and hearts for a playable level', () => {
    const w = mount(LevelPage, { props: { entry: playable }, global: { stubs } })
    expect(w.findAll('[data-testid="page-reward"]')).toHaveLength(4)
    // maxErrors = 2 → 3 hearts (you fail on the 3rd mistake)
    expect(w.findAll('[data-testid="page-heart"]')).toHaveLength(3)
  })

  it('emits "start" with the level id when START is pressed', async () => {
    const w = mount(LevelPage, { props: { entry: playable }, global: { stubs } })
    await w.get('[data-testid="page-start"]').trigger('click')
    expect(w.emitted('start')).toEqual([['level-01']])
  })

  it('renders coming-soon levels locked: no START, no rewards', () => {
    const w = mount(LevelPage, { props: { entry: comingSoon }, global: { stubs } })
    expect(w.find('[data-testid="page-start"]').exists()).toBe(false)
    expect(w.find('[data-testid="page-coming-soon"]').exists()).toBe(true)
    expect(w.findAll('[data-testid="page-reward"]')).toHaveLength(0)
  })
})

describe('LevelBook', () => {
  it('shows the first page initially with a page indicator', () => {
    const w = mount(LevelBook, { props: { entries: LEVEL_REGISTRY }, global: { stubs } })
    expect(w.get('[data-testid="page-title"]').text()).toContain('minbak')
    expect(w.get('[data-testid="book-indicator"]').text()).toContain('1')
    expect(w.get('[data-testid="book-indicator"]').text()).toContain('10')
  })

  it('flips forward and backward with the nav buttons', async () => {
    const w = mount(LevelBook, { props: { entries: LEVEL_REGISTRY }, global: { stubs } })
    await w.get('[data-testid="book-next"]').trigger('click')
    expect(w.get('[data-testid="page-title"]').text()).toContain('templo')
    await w.get('[data-testid="book-prev"]').trigger('click')
    expect(w.get('[data-testid="page-title"]').text()).toContain('minbak')
  })

  it('disables prev on first page and next on last page', async () => {
    const w = mount(LevelBook, { props: { entries: LEVEL_REGISTRY }, global: { stubs } })
    expect(w.get('[data-testid="book-prev"]').attributes('disabled')).toBeDefined()
    for (let i = 0; i < LEVEL_REGISTRY.length - 1; i++) {
      await w.get('[data-testid="book-next"]').trigger('click')
    }
    expect(w.get('[data-testid="book-next"]').attributes('disabled')).toBeDefined()
  })

  it('re-emits "start" from the active page', async () => {
    const w = mount(LevelBook, { props: { entries: LEVEL_REGISTRY }, global: { stubs } })
    await w.get('[data-testid="page-start"]').trigger('click')
    expect(w.emitted('start')).toEqual([['level-01']])
  })
})
