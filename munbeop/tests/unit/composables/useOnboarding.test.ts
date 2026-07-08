import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOnboarding } from '~/composables/useOnboarding'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useAppStatus } from '~/stores/appStatus'
import type { Grammar } from '~/lib/domain'

// Deterministic, storage-free adapter so add()/markSeen()/recalculate() resolve
// without touching real storage. Assertions read store state instead.
// (vi.mock is hoisted above the imports by Vitest, so the stores pick it up.)
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({
    read: vi.fn().mockResolvedValue(undefined),
    write: vi.fn().mockResolvedValue(undefined),
    append: vi.fn().mockResolvedValue(undefined),
    upsertOne: vi.fn().mockResolvedValue(undefined),
  }),
}))

const L = (s: string) => ({ en: s, es: s, fr: s, 'pt-BR': s, th: s, id: s, vi: s, ja: s })
const STARTER_KO = '-아/어서'
function seedStarterGrammar() {
  useGrammarStore().items = [{ ko: STARTER_KO, meaning: L('because'), deckId: 'topik-1' } as Grammar]
}

describe('useOnboarding', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('complete writes exactly one log entry, marks the grammar seen, sets the flag, closes', async () => {
    seedStarterGrammar()
    const ob = useOnboarding()
    const entry = await ob.complete('주말에 친구를 만나서 기분이 좋았어')

    const log = useLogStore()
    expect(log.entries).toHaveLength(1)
    expect(log.entries[0]!.ko).toBe(STARTER_KO)
    expect(log.entries[0]!.contextId).toBe('banmal')
    expect(log.entries[0]!.feedback).toBe('easy')
    expect(useSrsStore().map[STARTER_KO]).toBeTruthy()
    expect(localStorage.getItem('munbeop.onboarded')).toBe('1')
    expect(ob.open.value).toBe(false)
    expect(entry).not.toBeNull()
  })

  it('complete self-disables (no entry) when the starter grammar is absent', async () => {
    // grammar store left empty
    const ob = useOnboarding()
    const entry = await ob.complete('whatever')
    expect(useLogStore().entries).toHaveLength(0)
    expect(localStorage.getItem('munbeop.onboarded')).toBe('1')
    expect(entry).toBeNull()
  })

  it('skip sets the flag without writing a log entry', () => {
    const ob = useOnboarding()
    ob.skip()
    expect(useLogStore().entries).toHaveLength(0)
    expect(localStorage.getItem('munbeop.onboarded')).toBe('1')
    expect(ob.open.value).toBe(false)
  })

  it('shouldShow is true only when ready, log empty, not onboarded', () => {
    const ob = useOnboarding()
    useAppStatus().status = 'ready'
    expect(ob.shouldShow.value).toBe(true)
    expect(ob.showEmptyPlot.value).toBe(true)
    ob.skip()
    expect(ob.shouldShow.value).toBe(false) // onboarded now
    expect(ob.showEmptyPlot.value).toBe(true) // still empty → manual entry stays
  })
})
