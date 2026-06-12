import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CardDraw from '~/components/games/ruleta/CardDraw.vue'
import type { DrawCard } from '~/components/games/ruleta/cards'

const CARDS: DrawCard[] = [
  { ko: '-(으)ㄹ 수 있다', deckName: 'TOPIK 1', color: 'var(--sky)' },
  { ko: '-아/어서', deckName: 'TOPIK 1', color: 'var(--sky)' },
  { ko: '-기 때문에', deckName: 'TOPIK 2', color: 'var(--jade)' },
]

describe('CardDraw', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  async function mountDealt() {
    const w = mount(CardDraw, { props: { cards: CARDS } })
    vi.advanceTimersByTime(2000) // past the shuffle stage
    await w.vm.$nextTick()
    return w
  }

  it('shows the shuffle stage first, then deals 3 face-down cards', async () => {
    const w = mount(CardDraw, { props: { cards: CARDS } })
    expect(w.find('[data-testid="shuffle"]').exists()).toBe(true)
    expect(w.findAll('[data-testid="draw-card"]')).toHaveLength(0)

    vi.advanceTimersByTime(2000)
    await w.vm.$nextTick()
    expect(w.find('[data-testid="shuffle"]').exists()).toBe(false)
    expect(w.findAll('[data-testid="draw-card"]')).toHaveLength(3)
  })

  it('flips a card on click and reveals its grammar', async () => {
    const w = await mountDealt()
    const card = w.findAll('[data-testid="draw-card"]')[0]!
    expect(card.classes()).not.toContain('draw-card--flipped')
    await card.trigger('click')
    expect(card.classes()).toContain('draw-card--flipped')
    expect(card.text()).toContain('-(으)ㄹ 수 있다')
    expect(card.text()).toContain('TOPIK 1')
  })

  it('shows the CTA only after all 3 cards are flipped, then emits done', async () => {
    const w = await mountDealt()
    const cards = w.findAll('[data-testid="draw-card"]')

    await cards[0]!.trigger('click')
    await cards[1]!.trigger('click')
    expect(w.find('[data-testid="start-writing"]').exists()).toBe(false)

    await cards[2]!.trigger('click')
    const cta = w.find('[data-testid="start-writing"]')
    expect(cta.exists()).toBe(true)

    await cta.trigger('click')
    expect(w.emitted('done')).toHaveLength(1)
  })

  it('exposes the revealed grammar to screen readers after the flip', async () => {
    const w = await mountDealt()
    const card = w.findAll('[data-testid="draw-card"]')[0]!
    expect(card.attributes('aria-label')).toBe('practice.deck_flip_card 1')

    await card.trigger('click')
    // aria-label must drop so the accessible name comes from the revealed
    // content (deck band + grammar), and the live region must announce it.
    expect(card.attributes('aria-label')).toBeUndefined()
    expect(w.get('[data-testid="flip-announcer"]').text()).toContain('-(으)ㄹ 수 있다')
  })

  it('announces hand completion when the 3rd card flips', async () => {
    const w = await mountDealt()
    const cards = w.findAll('[data-testid="draw-card"]')
    await cards[0]!.trigger('click')
    await cards[1]!.trigger('click')
    await cards[2]!.trigger('click')
    expect(w.get('[data-testid="flip-announcer"]').text()).toContain(
      'practice.deck_all_revealed',
    )
  })

  it('ignores repeat clicks on an already-flipped card', async () => {
    const w = await mountDealt()
    const card = w.findAll('[data-testid="draw-card"]')[0]!
    await card.trigger('click')
    await card.trigger('click')
    expect(card.classes()).toContain('draw-card--flipped')
    expect(w.find('[data-testid="start-writing"]').exists()).toBe(false)
  })
})
