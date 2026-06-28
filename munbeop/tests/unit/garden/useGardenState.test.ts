import { useGardenState, gardenStateKey } from '~/composables/useGardenState'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import type { SrsState, LogEntry } from '~/lib/domain'

/**
 * CHARACTERIZATION tests for useGardenState — lock in current behavior.
 *
 * The real ~/lib/garden (progressPct/isTreeUnlocked/unlockedZoneCount) and
 * ~/lib/domain (isPendingReview, SPECIES_BY_LEVEL) run for real; only the
 * spine composable and the two stores are mocked with deterministic data.
 *
 * Observed constants at the time these were written:
 *   TREE_THRESHOLDS = { sprout: 10, leafy: 40, bloom: 80 }   (lib/garden/tree.ts)
 *   TREE_GATE_PCT   = 60   → level N unlocks when progress(N-1) >= 60
 */

// ── Mutable mock state, referenced from the hoisted vi.mock factories. ──────
const h = vi.hoisted(() => {
  const srsMap: Record<string, SrsState> = {}
  const logEntries: LogEntry[] = []
  // Deterministic mini-spine: level 1 has two items across two themes,
  // level 2 has one item, levels 3-6 are empty.
  const itemsByLevel = (l: number): Array<{ ko: string }> => {
    if (l === 1) return [{ ko: 'L1a' }, { ko: 'L1b' }]
    if (l === 2) return [{ ko: 'L2a' }]
    return []
  }
  const themesOfLevel = (l: number): Array<{ id: string; title: string }> => {
    if (l === 1) {
      return [
        { id: 't1_1', title: 'Theme 1-1' },
        { id: 't1_2', title: 'Theme 1-2' },
      ]
    }
    return []
  }
  const itemsByTheme = (id: string): Array<{ ko: string }> => {
    if (id === 't1_1') return [{ ko: 'L1a' }]
    if (id === 't1_2') return [{ ko: 'L1b' }]
    return []
  }
  return { srsMap, logEntries, itemsByLevel, themesOfLevel, itemsByTheme }
})

vi.mock('~/composables/useTopikSpine', () => ({
  useTopikSpine: () => ({
    itemsByLevel: h.itemsByLevel,
    itemsByTheme: h.itemsByTheme,
    themesOfLevel: h.themesOfLevel,
  }),
}))
vi.mock('~/stores/srs', () => ({ useSrsStore: () => ({ map: h.srsMap }) }))
vi.mock('~/stores/log', () => ({ useLogStore: () => ({ entries: h.logEntries }) }))

// useState returns a ref so `pick.value` reads/writes work; onMounted never
// fires outside a component, so pick stays at its initial null.
vi.stubGlobal('useState', (_key: string, init?: () => unknown) =>
  ref(init ? init() : null),
)

// ── Builders ───────────────────────────────────────────────────────────────
function srs(partial: Partial<SrsState> = {}): SrsState {
  return { lastSeen: null, easyCount: 0, hardCount: 0, mastery: 'seedling', ...partial }
}

let entryId = 0
function logEntry(partial: Partial<LogEntry> = {}): LogEntry {
  return {
    id: ++entryId,
    ko: 'L1a',
    sentence: 'sample',
    feedback: 'easy',
    errorNote: null,
    reviewState: 'unreviewed',
    contextId: 'ctx',
    contextName: 'Context',
    date: '2026-06-23',
    ...partial,
  }
}

beforeEach(() => {
  // Reset the shared mutable mock data between tests. (Reassign rather than
  // delete keys — the mock reads h.srsMap fresh each useSrsStore() call.)
  h.srsMap = {}
  h.logEntries.length = 0
  window.localStorage.clear()
})

// ─────────────────────────────────────────────────────────────────────────────
describe('gardenStateKey', () => {
  // Thresholds: sprout=10, leafy=40, bloom=80.
  it('is dormant below the sprout threshold', () => {
    expect(gardenStateKey(0)).toBe('dormant')
    expect(gardenStateKey(9)).toBe('dormant')
  })
  it('is sprouting at/above sprout but below leafy', () => {
    expect(gardenStateKey(10)).toBe('sprouting')
    expect(gardenStateKey(39)).toBe('sprouting')
  })
  it('is leafy at/above leafy but below bloom', () => {
    expect(gardenStateKey(40)).toBe('leafy')
    expect(gardenStateKey(79)).toBe('leafy')
  })
  it('is bloom at/above the bloom threshold', () => {
    expect(gardenStateKey(80)).toBe('bloom')
    expect(gardenStateKey(100)).toBe('bloom')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('useGardenState — levels', () => {
  it('exposes 6 levels in order 1..6 with the species mapping', () => {
    const g = useGardenState()
    const levels = g.levels.value
    expect(levels).toHaveLength(6)
    expect(levels.map((l) => l.level)).toEqual([1, 2, 3, 4, 5, 6])
    expect(levels.map((l) => l.species)).toEqual([
      'cherry',
      'magnolia',
      'zelkova',
      'mugunghwa',
      'maple',
      'ginkgo',
    ])
  })

  it('with an empty SRS map all pct are 0 and only level 1 is unlocked', () => {
    const g = useGardenState()
    const levels = g.levels.value
    expect(levels.map((l) => l.pct)).toEqual([0, 0, 0, 0, 0, 0])
    expect(levels.map((l) => l.unlocked)).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
    ])
    expect(g.highestUnlocked.value).toBe(1)
  })

  it('mastering level 1 (both kos = tree) drives pct to 100 and unlocks level 2', () => {
    // itemScore: tree=1 → progressPct over two items = round(2/2*100) = 100.
    h.srsMap.L1a = srs({ mastery: 'tree', lastSeen: 1000 })
    h.srsMap.L1b = srs({ mastery: 'tree', lastSeen: 2000 })
    const g = useGardenState()
    const levels = g.levels.value
    expect(levels[0]!.pct).toBe(100)
    expect(levels[0]!.unlocked).toBe(true)
    // Gate: progress(level 1) >= 60 → level 2 unlocked. Level 2 itself is 0 (L2a untouched).
    expect(levels[1]!.unlocked).toBe(true)
    expect(levels[1]!.pct).toBe(0)
    // Level 3 stays locked because progress(level 2) is still 0.
    expect(levels[2]!.unlocked).toBe(false)
    expect(g.highestUnlocked.value).toBe(2)
  })

  it('a single mastered level-1 ko (pct 50) is below the 60 gate so level 2 stays locked', () => {
    // round(1/2*100) = 50 < TREE_GATE_PCT(60).
    h.srsMap.L1a = srs({ mastery: 'tree', lastSeen: 1000 })
    const g = useGardenState()
    const levels = g.levels.value
    expect(levels[0]!.pct).toBe(50)
    expect(levels[1]!.unlocked).toBe(false)
    expect(g.highestUnlocked.value).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('useGardenState — activeLevel & setActiveLevel', () => {
  it('defaults activeLevel/active to the highest unlocked level', () => {
    // Empty SRS → only level 1 unlocked → active is level 1.
    const g = useGardenState()
    expect(g.activeLevel.value).toBe(1)
    expect(g.active.value.level).toBe(1)
  })

  it('setActiveLevel(2) when level 2 is unlocked moves the active level (pick updates)', () => {
    h.srsMap.L1a = srs({ mastery: 'tree' })
    h.srsMap.L1b = srs({ mastery: 'tree' })
    const g = useGardenState()
    expect(g.levels.value[1]!.unlocked).toBe(true)

    g.setActiveLevel(2)
    expect(g.activeLevel.value).toBe(2)
    expect(g.active.value.level).toBe(2)
    // CHARACTERIZED: the localStorage write at line 114 is guarded by
    // `import.meta.client`, which is falsy in this raw-vitest environment
    // (no Nuxt build injecting the flag), so NO write happens here even
    // though the pick — and thus activeLevel — did change.
    expect(window.localStorage.getItem('garden.activeLevel')).toBeNull()
  })

  it('setActiveLevel(N) for a locked level is a no-op (no pick change, no write)', () => {
    // Empty SRS → only level 1 unlocked; level 3 is locked.
    const g = useGardenState()
    g.setActiveLevel(3)
    expect(g.activeLevel.value).toBe(1)
    expect(window.localStorage.getItem('garden.activeLevel')).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('useGardenState — pendingReviews', () => {
  it('is 0 when the log is empty', () => {
    const g = useGardenState()
    expect(g.pendingReviews.value).toBe(0)
  })

  it('counts unreviewed entries that are hard or carry an error note', () => {
    h.logEntries.push(
      logEntry({ feedback: 'hard', reviewState: 'unreviewed' }), // pending (hard)
      logEntry({ feedback: 'easy', errorNote: 'oops', reviewState: 'unreviewed' }), // pending (note)
      logEntry({ feedback: 'easy', reviewState: 'unreviewed' }), // not pending (easy, no note)
      logEntry({ feedback: 'hard', reviewState: 'correct' }), // not pending (reviewed)
    )
    const g = useGardenState()
    expect(g.pendingReviews.value).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('useGardenState — lastPracticedAt', () => {
  it('is null when the SRS map is empty', () => {
    const g = useGardenState()
    expect(g.lastPracticedAt.value).toBeNull()
  })

  it('is null when every state has lastSeen === null', () => {
    h.srsMap.L1a = srs({ lastSeen: null })
    h.srsMap.L2a = srs({ lastSeen: null })
    const g = useGardenState()
    expect(g.lastPracticedAt.value).toBeNull()
  })

  it('is the maximum lastSeen across the SRS map', () => {
    h.srsMap.L1a = srs({ lastSeen: 500 })
    h.srsMap.L1b = srs({ lastSeen: 9000 })
    h.srsMap.L2a = srs({ lastSeen: 3000 })
    const g = useGardenState()
    expect(g.lastPracticedAt.value).toBe(9000)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('useGardenState — milestones & zones', () => {
  it('milestones is empty when nothing has progressed', () => {
    const g = useGardenState()
    expect(g.milestones.value).toEqual([])
  })

  it('milestones lists crossed visual thresholds plus tree:N for unlocked level 2+', () => {
    h.srsMap.L1a = srs({ mastery: 'tree' })
    h.srsMap.L1b = srs({ mastery: 'tree' })
    const g = useGardenState()
    const m = g.milestones.value
    // Level 1 at pct 100 crosses sprout/leafy/bloom.
    expect(m).toContain('1:sprout')
    expect(m).toContain('1:leafy')
    expect(m).toContain('1:bloom')
    // Level 2 is unlocked (gate met) and >= 2 → tree:2.
    expect(m).toContain('tree:2')
  })

  it('zones are the themes of the active level; only the first is open by default', () => {
    // Active level defaults to highest unlocked = 1; its two themes are at pct 0.
    const g = useGardenState()
    const zones = g.zones.value
    expect(zones.map((z) => z.id)).toEqual(['t1_1', 't1_2'])
    expect(zones.map((z) => z.title)).toEqual(['Theme 1-1', 'Theme 1-2'])
    expect(zones[0]!.unlocked).toBe(true)
    // Zone gate is 50; theme 1 at pct 0 < 50 → zone 2 stays closed.
    expect(zones[1]!.unlocked).toBe(false)
  })

  it('zones open the chain once the previous theme passes the 50 gate', () => {
    // Theme t1_1 = {L1a}; mark L1a as tree → progressPct 100 >= 50 → zone 2 opens.
    h.srsMap.L1a = srs({ mastery: 'tree' })
    const g = useGardenState()
    const zones = g.zones.value
    expect(zones[0]!.pct).toBe(100)
    expect(zones[0]!.unlocked).toBe(true)
    expect(zones[1]!.unlocked).toBe(true)
  })
})
