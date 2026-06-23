import { usePaths } from '~/composables/usePaths'
import { describe, it, expect, vi } from 'vitest'
import type { SrsState } from '~/lib/domain'

const st = (mastery: SrsState['mastery']): SrsState => ({ lastSeen: 1, easyCount: 1, hardCount: 0, mastery })

vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({
    decks: [
      { id: 'topik-2', name: 'TOPIK 2', order: 2 },
      { id: 'topik-1', name: 'TOPIK 1', order: 1 },
      { id: 'custom', name: 'Custom', order: 9 },
    ],
    items: [
      { ko: 'A', deckId: 'topik-1' },
      { ko: 'B', deckId: 'topik-1' },
      { ko: 'X', deckId: 'topik-2' },
      { ko: 'Z', deckId: 'custom' },
    ],
  }),
}))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ map: { A: st('tree') } }) }))

describe('usePaths', () => {
  it('returns the topik paths in deck order, custom skipped, kos ordered + progress computed', () => {
    const { paths } = usePaths()
    expect(paths.value.map((p) => p.deckId)).toEqual(['topik-1', 'topik-2'])
    const t1 = paths.value[0]!
    expect(t1.progress.items.map((i) => i.ko)).toEqual(['A', 'B'])
    expect(t1.progress.learned).toBe(1)
    expect(t1.progress.nextKo).toBe('B')
  })
})
