import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VictoryScreen from '~/components/escape-room/VictoryScreen.vue'
import GameOverScreen from '~/components/escape-room/GameOverScreen.vue'
import { makeLevel } from '../../unit/escape-room/_fixture'

describe('VictoryScreen', () => {
  it('shows the earned tier, its reward and the outro narrative', () => {
    const level = makeLevel()
    const w = mount(VictoryScreen, { props: { level, tier: 'epic' } })
    expect(w.get('[data-testid="victory-tier"]').text()).toContain('escape.tier_epic')
    expect(w.get('[data-testid="victory-reward"]').text()).toContain('Epic')
    expect(w.get('[data-testid="victory-outro"]').text()).toContain('outro p1')
    expect(w.get('[data-testid="victory-voice"]').text()).toContain('잘 가요!')
  })

  it('emits exit when the continue button is pressed', async () => {
    const w = mount(VictoryScreen, { props: { level: makeLevel(), tier: 'common' } })
    await w.get('[data-testid="victory-exit"]').trigger('click')
    expect(w.emitted('exit')).toBeTruthy()
  })

  it('substitutes the {farewell} token in the outro with the player’s sentence', () => {
    const level = makeLevel({
      outro: {
        en: 'You said: «{farewell}».',
        es: 'Dijiste: «{farewell}».',
        fr: 'Dijiste: «{farewell}».',
        'pt-BR': 'Dijiste: «{farewell}».',
        th: 'Dijiste: «{farewell}».',
        id: 'Dijiste: «{farewell}».',
        vi: 'Dijiste: «{farewell}».',
        ja: 'Dijiste: «{farewell}».',
      },
    })
    const w = mount(VictoryScreen, {
      props: { level, tier: 'common', farewell: '스승님, 그동안 정말 감사했어요' },
    })
    const outro = w.get('[data-testid="victory-outro"]').text()
    expect(outro).toContain('스승님, 그동안 정말 감사했어요')
    expect(outro).not.toContain('{farewell}')
  })
})

describe('GameOverScreen', () => {
  it('renders the soft game-over copy', () => {
    const w = mount(GameOverScreen)
    expect(w.get('[data-testid="gameover-title"]').text()).toContain('escape.game_over_title')
  })

  it('emits retry and exit from their buttons', async () => {
    const w = mount(GameOverScreen)
    await w.get('[data-testid="gameover-retry"]').trigger('click')
    await w.get('[data-testid="gameover-exit"]').trigger('click')
    expect(w.emitted('retry')).toBeTruthy()
    expect(w.emitted('exit')).toBeTruthy()
  })
})
