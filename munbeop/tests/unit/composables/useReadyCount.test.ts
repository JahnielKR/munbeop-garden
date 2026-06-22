import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import type { SrsState } from '~/lib/domain'

// Shared reactive srs state the mocked store reads from.
const state = reactive({ map: {} as Record<string, SrsState> })
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ get map() { return state.map } }) }))

import { useReadyCount } from '~/composables/useReadyCount'

// lastSeen = epoch (0) → always far past its interval → due regardless of "now".
const due = (over: Partial<SrsState> = {}): SrsState => ({
  lastSeen: 0,
  easyCount: 1,
  hardCount: 0,
  mastery: 'plant',
  ...over,
})

beforeEach(() => {
  state.map = {}
})

describe('useReadyCount', () => {
  it('exposes the due kos and their count', () => {
    state.map = { 가다: due(), 오다: due() }
    const { readyKos, readyCount } = useReadyCount()
    expect(readyKos.value.slice().sort()).toEqual(['가다', '오다'])
    expect(readyCount.value).toBe(2)
  })

  it('caps displayCount at READY_DISPLAY_CAP and flips hasMore past it', () => {
    const map: Record<string, SrsState> = {}
    for (let i = 0; i < 12; i++) map[`g${i}`] = due()
    state.map = map
    const { readyCount, displayCount, hasMore } = useReadyCount()
    expect(readyCount.value).toBe(12)
    expect(displayCount.value).toBe(9)
    expect(hasMore.value).toBe(true)
  })

  it('is zero/false for an empty srs map', () => {
    const { readyCount, displayCount, hasMore } = useReadyCount()
    expect(readyCount.value).toBe(0)
    expect(displayCount.value).toBe(0)
    expect(hasMore.value).toBe(false)
  })
})
