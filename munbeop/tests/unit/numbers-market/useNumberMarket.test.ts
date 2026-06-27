import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNumberMarket } from '~/composables/useNumberMarket'

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  if (typeof localStorage !== 'undefined') localStorage.clear()
})

describe('useNumberMarket (Learn)', () => {
  it('starts a build round for a domain with a shuffled tile pool', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    expect(m.phase.value).toBe('building')
    expect(m.sessionItems.value.length).toBeGreaterThan(0)
    expect(m.built.value).toEqual([])
    expect(m.pool.value.length).toBe(m.item.value.tiles.length + m.item.value.lures.length)
  })

  it('placing the correct tiles in order then submitting is right', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    for (const tile of m.item.value.tiles) {
      const idx = m.pool.value.indexOf(tile)
      m.placeTile(idx)
    }
    m.submit()
    expect(m.phase.value).toBe('right')
    expect(m.built.value.join(' ')).toBe(m.item.value.answer)
  })

  it('a wrong build submits as wrong; undo/clear restore the pool', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    const lure = m.item.value.lures[0]!
    m.placeTile(m.pool.value.indexOf(lure))
    expect(m.built.value).toEqual([lure])
    m.undoTile()
    expect(m.built.value).toEqual([])
    expect(m.pool.value).toContain(lure)
    m.placeTile(0)
    m.clearTiles()
    expect(m.built.value).toEqual([])
  })

  it('advancing to done records mastery for a clean normal round', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    while (m.phase.value !== 'done') {
      for (const tile of m.item.value.tiles) m.placeTile(m.pool.value.indexOf(tile))
      m.submit()
      m.next()
    }
    expect(m.score.value.accuracy).toBe(1)
    expect(m.master.doneCount.value).toBe(1)
    expect(localStorage.getItem('number-market.cleared')).toContain('time')
  })

  it('replayFailed re-drills only the missed items', () => {
    const m = useNumberMarket()
    m.selectDomain('time')
    m.start()
    let first = true
    while (m.phase.value !== 'done') {
      if (first) {
        m.placeTile(m.pool.value.indexOf(m.item.value.lures[0]!)) // wrong on purpose
        first = false
      } else {
        for (const tile of m.item.value.tiles) m.placeTile(m.pool.value.indexOf(tile))
      }
      m.submit()
      m.next()
    }
    expect(m.failedItems.value.length).toBe(1)
    m.replayFailed()
    expect(m.runMode.value).toBe('replay')
    expect(m.sessionItems.value.length).toBe(1)
  })
})
