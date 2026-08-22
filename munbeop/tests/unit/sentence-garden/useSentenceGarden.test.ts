import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSentenceGarden } from '~/composables/useSentenceGarden'
import { useAuthStore } from '~/stores/auth'

const added: unknown[] = []
const addIds: number[] = []
const seen: string[] = []
const played: string[] = []
let nextEntryId = 6000
const createEntryId = vi.fn(() => ++nextEntryId)
const addFn = vi.fn(async (e: unknown, stableId: number) => {
  added.push(e)
  addIds.push(stableId)
})
const markSeen = vi.fn(async (ko: string) => {
  seen.push(ko)
})
const recalculateFn = vi.fn(async () => {})
vi.stubGlobal('useNuxtApp', () => ({ $supabase: null }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ add: addFn, createEntryId }) }))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ markSeen, recalculate: recalculateFn }) }))
vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: async () => {} }) }))
vi.mock('~/composables/useExampleAudio', () => ({
  useExampleAudio: () => ({
    playExample: (s: string) => {
      played.push(s)
    },
    stop: () => {},
  }),
}))

describe('useSentenceGarden', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    added.length = 0
    addIds.length = 0
    seen.length = 0
    played.length = 0
    nextEntryId = 6000
    createEntryId.mockClear()
    addFn.mockReset()
    addFn.mockImplementation(async (e: unknown, stableId: number) => {
      added.push(e)
      addIds.push(stableId)
    })
    markSeen.mockReset()
    markSeen.mockImplementation(async (ko: string) => {
      seen.push(ko)
    })
    recalculateFn.mockReset()
    recalculateFn.mockResolvedValue(undefined)
  })

  it('start seeds a session and marks each grammar seen', async () => {
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    expect(sg.sessionItems.value.length).toBeGreaterThan(0)
    expect(seen).toContain('-아/어요')
    // a fresh round deals every card to the tray, none placed
    expect(sg.placed.value).toHaveLength(0)
    expect(sg.tray.value.length).toBe(sg.item.value.cards.length)
  })

  it('start builds a playable session even when the mark-seen cloud writes fail', async () => {
    // Regression: start used to await the SRS upserts before the page flipped
    // to play, so a flaky network turned a deck tap into a silent no-op.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    markSeen.mockRejectedValue(new Error('network down'))
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    expect(sg.sessionItems.value.length).toBeGreaterThan(0)
    expect(sg.tray.value.length).toBe(sg.item.value.cards.length)
    await new Promise((r) => setTimeout(r, 0)) // flush the swallowed rejection
    expect(errSpy).toHaveBeenCalled()
    expect(sg.saveError.value).toBe(true)
    errSpy.mockRestore()
  })

  it('retries only the mark-seen writes that failed at start', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    markSeen.mockRejectedValueOnce(new Error('offline'))
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(sg.saveError.value).toBe(true)

    markSeen.mockImplementation(async (ko: string) => {
      seen.push(ko)
    })
    await expect(sg.retrySave()).resolves.toBe(true)
    expect(sg.saveError.value).toBe(false)
    expect(markSeen).toHaveBeenCalledTimes(2)
    errSpy.mockRestore()
  })

  it('placing the model order correctly verifies, plays audio, and a correct round waters the plant on finish', async () => {
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
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
    sg.start(['-아/어요'])
    const card = sg.tray.value[0]!
    const trayLen = sg.tray.value.length
    sg.place(card)
    expect(sg.placed.value).toHaveLength(1)
    expect(sg.tray.value).toHaveLength(trayLen - 1)
    sg.removeAt(0)
    expect(sg.placed.value).toHaveLength(0)
    expect(sg.tray.value).toHaveLength(trayLen)
  })

  it('a wrong placement marks the round wrong, logs a hard miss, and plays no audio', async () => {
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    const round = sg.item.value
    const decoy = sg.tray.value.find((c) => !round.answer.includes(c.text))
    expect(decoy).toBeTruthy() // a TOPIK-1 session always has a sibling decoy
    sg.place(decoy!) // decoy in slot 0 → guaranteed mismatch vs the model order
    while (sg.placed.value.length < round.answer.length) sg.place(sg.tray.value[0]!)
    expect(sg.canCheck.value).toBe(true)
    sg.check()
    expect(sg.phase.value).toBe('wrong')
    expect(played).toHaveLength(0)
    await new Promise((r) => setTimeout(r, 0)) // logMistake queues behind the mark-seen batch
    expect(added.some((e) => (e as { feedback: string }).feedback === 'hard')).toBe(true)
  })

  it('finish reports failure instead of throwing when a credit write fails', async () => {
    // Regression: the summary renders before finish() resolves (phase is
    // already 'done'), so a rejected write used to silently eat the round's
    // SRS credit behind a normal-looking summary.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    while (sg.phase.value !== 'done') {
      if (sg.phase.value === 'placing') {
        for (const word of sg.item.value.answer) {
          const card = sg.tray.value.find((c) => c.text === word)!
          sg.place(card)
        }
        sg.check()
      }
      await sg.next()
    }
    addFn.mockRejectedValueOnce(new Error('net drop'))
    await expect(sg.finish()).resolves.toBe(false)
    expect(sg.saveError.value).toBe(true)
    await expect(sg.retrySave()).resolves.toBe(true)
    expect(sg.saveError.value).toBe(false)
    expect(addFn.mock.calls[0]![1]).toBe(addFn.mock.calls[1]![1])
    errSpy.mockRestore()
  })

  it('a saved log needs no secondary SRS retry', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    while (sg.phase.value !== 'done') {
      if (sg.phase.value === 'placing') {
        for (const word of sg.item.value.answer) {
          sg.place(sg.tray.value.find((card) => card.text === word)!)
        }
        sg.check()
      }
      await sg.next()
    }

    await expect(sg.finish()).resolves.toBe(true)
    const easyWrites = () =>
      added.filter((entry) => (entry as { feedback: string }).feedback === 'easy')
    expect(easyWrites()).toHaveLength(1)
    await expect(sg.retrySave()).resolves.toBe(true)
    expect(easyWrites()).toHaveLength(1)
    expect(recalculateFn).not.toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it('retries a remotely committed mistake with the same id after a lost response', async () => {
    const remoteIds = new Set<number>()
    let loseResponse = true
    addFn.mockImplementation(async (entry: unknown, stableId: number) => {
      if (!remoteIds.has(stableId)) {
        remoteIds.add(stableId)
        added.push(entry)
      }
      addIds.push(stableId)
      if (loseResponse) {
        loseResponse = false
        throw new Error('response lost after commit')
      }
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    const round = sg.item.value
    const decoy = sg.tray.value.find((card) => !round.answer.includes(card.text))!
    sg.place(decoy)
    while (sg.placed.value.length < round.answer.length) sg.place(sg.tray.value[0]!)
    sg.check()
    await sg.next()

    expect(sg.saveError.value).toBe(true)
    await expect(sg.retrySave()).resolves.toBe(true)
    expect(addIds).toHaveLength(2)
    expect(addIds[0]).toBe(addIds[1])
    expect(remoteIds.size).toBe(1)
    errSpy.mockRestore()
  })

  it("finish waits for the session's mark-seen writes before crediting (write ordering)", async () => {
    // Exposure timestamps settle before the atomic diary/progress credit.
    let releaseMarkSeen!: () => void
    markSeen.mockImplementation((ko: string) => {
      seen.push(ko)
      return new Promise<void>((resolve) => {
        releaseMarkSeen = resolve
      })
    })
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    while (sg.phase.value !== 'done') {
      if (sg.phase.value === 'placing') {
        for (const word of sg.item.value.answer) {
          const card = sg.tray.value.find((c) => c.text === word)!
          sg.place(card)
        }
        sg.check()
      }
      await sg.next()
    }
    const done = sg.finish()
    await new Promise((r) => setTimeout(r, 0))
    expect(added).toHaveLength(0) // credits still queued behind mark-seen
    releaseMarkSeen()
    await expect(done).resolves.toBe(true)
    expect(added.some((e) => (e as { feedback: string }).feedback === 'easy')).toBe(true)
  })

  it('a replay run credits nothing to SRS', async () => {
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    // fail every round (decoy in slot 0) so there is something to replay
    while (sg.phase.value !== 'done') {
      if (sg.phase.value === 'placing') {
        const round = sg.item.value
        const decoy = sg.tray.value.find((c) => !round.answer.includes(c.text))
        if (decoy) sg.place(decoy)
        while (sg.placed.value.length < round.answer.length) sg.place(sg.tray.value[0]!)
        sg.check()
      }
      await sg.next()
    }
    await sg.finish()
    added.length = 0 // ignore the normal run's logs
    sg.replayFailed()
    expect(sg.runMode.value).toBe('replay')
    while (sg.phase.value !== 'done') {
      if (sg.phase.value === 'placing') {
        for (const word of sg.item.value.answer) {
          const card = sg.tray.value.find((c) => c.text === word)!
          sg.place(card)
        }
        sg.check()
      }
      await sg.next()
    }
    await sg.finish()
    expect(added.some((e) => (e as { feedback: string }).feedback === 'easy')).toBe(false)
  })

  it('does not write a pending account-A mistake after account B signs in', async () => {
    useAuthStore().user = { id: 'account-a' } as never
    let releaseMarkSeen!: () => void
    markSeen.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          releaseMarkSeen = resolve
        }),
    )
    const sg = useSentenceGarden()
    sg.start(['-아/어요'])
    await vi.waitFor(() => expect(markSeen).toHaveBeenCalledTimes(1))
    const round = sg.item.value
    const decoy = sg.tray.value.find((card) => !round.answer.includes(card.text))!
    sg.place(decoy)
    while (sg.placed.value.length < round.answer.length) sg.place(sg.tray.value[0]!)
    sg.check()

    useAuthStore().user = { id: 'account-b' } as never
    releaseMarkSeen()
    await sg.next()

    expect(addFn).not.toHaveBeenCalled()
    expect(recalculateFn).not.toHaveBeenCalled()
  })
})
