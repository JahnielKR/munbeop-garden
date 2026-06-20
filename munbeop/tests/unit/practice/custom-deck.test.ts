import { describe, it, expect } from 'vitest'
import { buildCustomDeckOptions, MIN_CUSTOM_PLAYABLE } from '~/components/games/ruleta/cards'
import type { CustomDeck } from '~/lib/domain'

function deck(over: Partial<CustomDeck>): CustomDeck {
  return {
    id: 'c1', name: 'My deck', colorId: 'rose', icon: 'deck-star',
    grammarKos: [], order: 0, createdAt: '2026-06-20T00:00:00.000Z', ...over,
  }
}

const SIX = ['-아서', '-니까', '-는데', '-거든요', '-잖아요', '-더라고요']

describe('buildCustomDeckOptions', () => {
  it('marks a deck with fewer than 6 grammars as locked (too_few)', () => {
    const opts = buildCustomDeckOptions({
      decks: [deck({ id: 'big', grammarKos: SIX }), deck({ id: 'tiny', grammarKos: SIX.slice(0, 3) })],
    })
    expect(opts.find((o) => o.id === 'big')!.disabled).toBe(false)
    const tiny = opts.find((o) => o.id === 'tiny')!
    expect(tiny.disabled).toBe(true)
    expect(tiny.reason).toBe('too_few')
  })

  it('reports count, resolves the color, and carries icon/imageUrl', () => {
    const opts = buildCustomDeckOptions({
      decks: [deck({ id: 'big', grammarKos: SIX, icon: 'deck-flame', imageUrl: 'https://x/y.png' })],
    })
    const o = opts[0]!
    expect(o.count).toBe(6)
    expect(o.colors[0]).toBeTruthy()
    expect(o.icon).toBe('deck-flame')
    expect(o.imageUrl).toBe('https://x/y.png')
  })

  it('sorts by order', () => {
    const opts = buildCustomDeckOptions({
      decks: [deck({ id: 'b', order: 1 }), deck({ id: 'a', order: 0 })],
    })
    expect(opts.map((o) => o.id)).toEqual(['a', 'b'])
  })

  it('exposes the 6-grammar play minimum', () => {
    expect(MIN_CUSTOM_PLAYABLE).toBe(6)
  })
})
