import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const added: unknown[] = []
const seen: string[] = []
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add: async (e: unknown) => { added.push(e) } }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ markSeen: async (ko: string) => { seen.push(ko) }, recalculate: async () => {} }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: async () => {} }) }))
const played: string[] = []
vi.mock('~/composables/useExampleAudio', () => ({ useExampleAudio: () => ({ playExample: (s: string) => { played.push(s) }, stop: () => {} }) }))

import { useSentenceGarden } from '~/composables/useSentenceGarden'

describe('useSentenceGarden', () => {
  beforeEach(() => { setActivePinia(createPinia()); added.length = 0; seen.length = 0; played.length = 0 })

  it('start seeds a session and marks each grammar seen', async () => {
    const sg = useSentenceGarden()
    await sg.start(['-아/어요'])
    expect(sg.sessionItems.value.length).toBeGreaterThan(0)
    expect(seen).toContain('-아/어요')
    // a fresh round deals every card to the tray, none placed
    expect(sg.placed.value).toHaveLength(0)
    expect(sg.tray.value.length).toBe(sg.item.value.cards.length)
  })

  it('placing the model order correctly verifies, plays audio, and a correct round waters the plant on finish', async () => {
    const sg = useSentenceGarden()
    await sg.start(['-아/어요'])
    const round = sg.item.value
    // place the cards in the model order by matching text
    for (const word of round.answer) {
      const card = sg.tray.value.find((c) => c.text === word)!
      sg.place(card)
    }
    expect(sg.canCheck.value).toBe(true)
    sg.check()
    expect(sg.phase.value).toBe('right')
    expect(played).toContain(round.sentence)
    // drive to done, then finish
    while (sg.phase.value !== 'done') {
      if (sg.phase.value === 'placing') {
        // auto-pass remaining rounds by placing their model order
        for (const word of sg.item.value.answer) {
          const card = sg.tray.value.find((c) => c.text === word)!
          sg.place(card)
        }
        sg.check()
      }
      await sg.next()
    }
    await sg.finish()
    expect(added.some((e) => (e as { feedback: string }).feedback === 'easy')).toBe(true)
  })

  it('removeAt returns a placed card to the tray', async () => {
    const sg = useSentenceGarden()
    await sg.start(['-아/어요'])
    const card = sg.tray.value[0]!
    const trayLen = sg.tray.value.length
    sg.place(card)
    expect(sg.placed.value).toHaveLength(1)
    expect(sg.tray.value).toHaveLength(trayLen - 1)
    sg.removeAt(0)
    expect(sg.placed.value).toHaveLength(0)
    expect(sg.tray.value).toHaveLength(trayLen)
  })
})
