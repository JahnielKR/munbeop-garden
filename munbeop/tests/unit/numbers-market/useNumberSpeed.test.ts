import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNumberSpeed } from '~/composables/useNumberSpeed'

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  if (typeof localStorage !== 'undefined') localStorage.clear()
})

describe('useNumberSpeed', () => {
  it('starts a deck with 4 choices, full timer, zero score', () => {
    const s = useNumberSpeed()
    s.start('time')
    expect(s.phase.value).toBe('playing')
    expect(s.timeLeft.value).toBe(60)
    expect(s.score.value).toBe(0)
    expect(s.choices.value).toHaveLength(4)
    expect(s.choices.value).toContain(s.item.value.answer)
  })

  it('a correct answer scores + grows combo; a wrong answer breaks combo', () => {
    const s = useNumberSpeed()
    s.start('time')
    s.answer(s.item.value.answer)
    expect(s.score.value).toBe(1)
    expect(s.combo.value).toBe(1)
    const wrong = s.choices.value.find((c) => c !== s.item.value.answer)!
    s.answer(wrong)
    expect(s.combo.value).toBe(0)
    expect(s.score.value).toBe(1)
    expect(s.bestStreak.value).toBe(1)
  })

  it('tick counts down and finishes at zero, persisting a best score', () => {
    const s = useNumberSpeed()
    s.start('mixed')
    s.answer(s.item.value.answer) // score 1
    for (let i = 0; i < 60; i++) s.tick()
    expect(s.phase.value).toBe('done')
    expect(s.timeLeft.value).toBe(0)
    expect(JSON.parse(localStorage.getItem('number-market.speed.best')!)).toEqual({ mixed: 1 })
  })

  it('keeps the higher best score across runs', () => {
    const s = useNumberSpeed()
    s.start('mixed'); s.answer(s.item.value.answer); s.answer(s.item.value.answer); s.finish() // best 2
    s.start('mixed'); s.answer(s.item.value.answer); s.finish() // run scored 1, best stays 2
    expect(s.bestScore.value).toBe(2)
  })

  it('answering or ticking after done is a no-op', () => {
    const s = useNumberSpeed()
    s.start('time'); s.finish()
    const before = s.score.value
    s.answer(s.item.value.answer)
    s.tick()
    expect(s.score.value).toBe(before)
    expect(s.timeLeft.value).toBe(60)
  })

  it('answered increments per answer and resets on start (drives the SR announcer)', () => {
    const s = useNumberSpeed()
    s.start('mixed')
    expect(s.answered.value).toBe(0)
    s.answer(s.item.value.answer)
    s.answer('definitely-wrong')
    expect(s.answered.value).toBe(2)
    s.start('mixed')
    expect(s.answered.value).toBe(0)
  })
})
