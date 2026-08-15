import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useParticleSpacing } from '~/composables/useParticleSpacing'

const record = vi.fn(async () => {})
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record }) }))

beforeEach(() => {
  setActivePinia(createPinia())
  record.mockClear()
})

describe('useParticleSpacing activity', () => {
  it('records exactly one daily activity tick when an answer is checked', () => {
    const drill = useParticleSpacing()
    drill.start()
    drill.check()
    drill.check() // phase guard prevents a double count
    expect(record).toHaveBeenCalledTimes(1)
  })

  it('does not skip a fresh question when next is emitted twice', () => {
    const drill = useParticleSpacing()
    drill.start()
    drill.check()
    drill.next()
    const advancedIndex = drill.index.value

    drill.next()

    expect(drill.index.value).toBe(advancedIndex)
    expect(drill.phase.value).toBe('question')
  })
})
