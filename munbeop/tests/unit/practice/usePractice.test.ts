// tests/unit/practice/usePractice.test.ts
// Characterization tests — lock in the ACTUAL behaviour of usePractice.
// SUT import must stay at the top (import/first lint rule).
import { usePractice } from '~/composables/usePractice'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ---------------------------------------------------------------------------
// Store mocks — hoisted by vitest before the SUT import executes.
// ---------------------------------------------------------------------------

const markSeen = vi.fn(async () => {})
const recalculate = vi.fn(async () => {})
const add = vi.fn(async (e: unknown) => ({ id: 1, ...(e as object) }))

vi.mock('~/stores/srs', () => ({
  useSrsStore: () => ({ markSeen, recalculate, weightFor: () => 1 }),
}))

vi.mock('~/stores/log', () => ({
  useLogStore: () => ({ add, entries: [] }),
}))

// Build a grammar pool of 5 items — 3+ satisfies the engine's hard floor.
const GRAMMAR_ITEMS = [
  { ko: '이/가', deckId: 'topik-1' },
  { ko: '은/는', deckId: 'topik-1' },
  { ko: '을/를', deckId: 'topik-1' },
  { ko: '에서', deckId: 'topik-2' },
  { ko: '(으)로', deckId: 'topik-2' },
]

vi.mock('~/stores/grammar', () => ({
  useGrammarStore: () => ({
    items: GRAMMAR_ITEMS,
    // All indices active by default (all items belong to non-excluded decks).
    activeIndices: [0, 1, 2, 3, 4],
  }),
}))

// MIN_ACTIVE_CONTEXTS is 3; we export that same value so the error case test
// can provide only 2 contexts (below the minimum).
const MOCK_CONTEXTS = [
  { id: 'ctx-1', name: '직장' },
  { id: 'ctx-2', name: '학교' },
  { id: 'ctx-3', name: '카페' },
  { id: 'ctx-4', name: '집' },
]

// The mock is stateful: `mockActiveContexts` is reassigned per test.
let mockActiveContexts: typeof MOCK_CONTEXTS = MOCK_CONTEXTS

vi.mock('~/stores/contexts', () => ({
  useContextsStore: () => ({ active: mockActiveContexts }),
  MIN_ACTIVE_CONTEXTS: 3,
}))

// useLeeches is a composable that internally calls useGrammarStore +
// useLogStore (both already mocked). We still mock the composable itself so
// leechKos returns an empty Set — no leech cap interference in these tests.
vi.mock('~/composables/useLeeches', () => ({
  useLeeches: () => ({ leechKos: { value: new Set<string>() } }),
}))

vi.mock('~/stores/activity', () => ({ useActivityStore: () => ({ record: vi.fn(async () => {}) }) }))

// ---------------------------------------------------------------------------
// Nuxt auto-import stubs — useRoute + useI18n.
// useI18n is already globally stubbed by tests/setup.ts (key-echo), so we
// only need to handle useRoute here. We override it per test by re-stubbing
// with a mutable route query object.
// ---------------------------------------------------------------------------

let routeQuery: Record<string, unknown> = {}

beforeEach(() => {
  setActivePinia(createPinia())
  // Reset stubs.
  routeQuery = {}
  vi.stubGlobal('useRoute', () => ({ query: routeQuery }))
  markSeen.mockClear()
  recalculate.mockClear()
  add.mockClear()
  // Restore full context list between tests.
  mockActiveContexts = MOCK_CONTEXTS
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePractice', () => {
  // -------------------------------------------------------------------------
  // 1. Too few active contexts → error, no session
  // -------------------------------------------------------------------------
  it('sets error and no session when active contexts are below the minimum', async () => {
    // Provide only 2 active contexts (MIN_ACTIVE_CONTEXTS = 3).
    mockActiveContexts = [
      { id: 'ctx-1', name: '직장' },
      { id: 'ctx-2', name: '학교' },
    ]
    const p = usePractice()
    await p.start()
    expect(p.error.value).toBe('practice.no_contexts')
    expect(p.session.value).toBeNull()
  })

  // -------------------------------------------------------------------------
  // 2. Focus round: route.query.focus points at a known ko
  // -------------------------------------------------------------------------
  it('creates a 3-pick single-grammar session when route.query.focus matches a ko', async () => {
    routeQuery = { focus: '은/는' }
    const p = usePractice()
    await p.start()
    expect(p.session.value).not.toBeNull()
    const picks = p.session.value!.picks
    expect(picks).toHaveLength(3)
    // All picks must point to the same grammar index (index of '은/는' = 1).
    const focusIdx = GRAMMAR_ITEMS.findIndex((g) => g.ko === '은/는')
    for (const pick of picks) {
      expect(pick.grammarIdx).toBe(focusIdx)
    }
    // markSeen called exactly once with the focused ko.
    expect(markSeen).toHaveBeenCalledTimes(1)
    expect(markSeen).toHaveBeenCalledWith('은/는')
  })

  // -------------------------------------------------------------------------
  // 3a. Deck draw with pool ≥ 3 → session with 3 picks; markSeen × 3
  // -------------------------------------------------------------------------
  it('creates a 3-pick session via deck draw when no focus or custom deck', async () => {
    // routeQuery is empty → no focus.
    const p = usePractice()
    await p.start()
    expect(p.error.value).toBeNull()
    expect(p.session.value).not.toBeNull()
    expect(p.session.value!.picks).toHaveLength(3)
    expect(markSeen).toHaveBeenCalledTimes(3)
  })

  // -------------------------------------------------------------------------
  // 3b. Deck draw with an explicit deckId that has < 3 items → error
  // -------------------------------------------------------------------------
  it('sets error when the filtered deck pool has fewer than 3 items', async () => {
    // 'topik-99' matches no grammar items → pool = 0.
    const p = usePractice()
    await p.start({ deckId: 'topik-99' })
    expect(p.error.value).toBe('practice.no_grammars')
    expect(p.session.value).toBeNull()
  })

  // -------------------------------------------------------------------------
  // 4a. Custom deck with ≥ 3 valid kos → session created
  // -------------------------------------------------------------------------
  it('creates a session from a custom deck with 3+ valid kos', async () => {
    const p = usePractice()
    await p.start({ customDeckGrammarKos: ['이/가', '은/는', '을/를'] })
    expect(p.error.value).toBeNull()
    expect(p.session.value).not.toBeNull()
    expect(p.session.value!.picks).toHaveLength(3)
    expect(markSeen).toHaveBeenCalledTimes(3)
  })

  // -------------------------------------------------------------------------
  // 4b. Custom deck with < 3 valid kos → error
  // -------------------------------------------------------------------------
  it('sets error when the custom deck pool resolves to fewer than 3 items', async () => {
    // Only 2 valid kos → pool < 3.
    const p = usePractice()
    await p.start({ customDeckGrammarKos: ['이/가', '은/는'] })
    expect(p.error.value).toBe('practice.no_grammars')
    expect(p.session.value).toBeNull()
  })

  // -------------------------------------------------------------------------
  // 5. Explicit deckId overrides stale route.query.focus
  // -------------------------------------------------------------------------
  it('ignores route.query.focus when an explicit deckId is provided', async () => {
    // Focus param is set but an explicit deckId should take priority.
    routeQuery = { focus: '이/가' }
    const p = usePractice()
    // 'topik-1' has 3 items → pool succeeds via deck draw, not focus.
    await p.start({ deckId: 'topik-1' })
    expect(p.error.value).toBeNull()
    expect(p.session.value).not.toBeNull()
    const picks = p.session.value!.picks
    // In a focus round all 3 picks share the same grammarIdx.
    // A deck draw picks from the whole pool → it is NOT forced to be all the same.
    // We verify that this is NOT a forced single-grammar focus by checking that
    // markSeen was called 3 times (focus only calls it once with the focused ko).
    expect(markSeen).toHaveBeenCalledTimes(3)
    // All 3 picks must come from topik-1 indices (0, 1, 2).
    for (const pick of picks) {
      expect([0, 1, 2]).toContain(pick.grammarIdx)
    }
  })

  // -------------------------------------------------------------------------
  // 6a. persistEntry: feedback 'hard' + non-empty errorNote → 'incorrect'
  // -------------------------------------------------------------------------
  it('logs reviewState=incorrect when feedback is hard and errorNote is non-empty', async () => {
    const p = usePractice()
    await p.start()
    const result = await p.persistEntry({
      pickIndex: 0,
      sentence: '나는 학생이에요.',
      feedback: 'hard',
      errorNote: 'missed particle',
      errorDimension: 'grammar',
    })
    expect(result).not.toBeNull()
    expect(add).toHaveBeenCalledTimes(1)
    expect(add.mock.calls[0][0]).toMatchObject({
      feedback: 'hard',
      reviewState: 'incorrect',
    })
    expect(recalculate).toHaveBeenCalledTimes(1)
  })

  // -------------------------------------------------------------------------
  // 6b. persistEntry: feedback 'easy' → 'unreviewed'
  // -------------------------------------------------------------------------
  it('logs reviewState=unreviewed when feedback is easy', async () => {
    const p = usePractice()
    await p.start()
    const result = await p.persistEntry({
      pickIndex: 0,
      sentence: '나는 학생이에요.',
      feedback: 'easy',
      errorNote: null,
    })
    expect(result).not.toBeNull()
    expect(add.mock.calls[0][0]).toMatchObject({ feedback: 'easy', reviewState: 'unreviewed' })
    expect(recalculate).toHaveBeenCalledTimes(1)
  })

  // -------------------------------------------------------------------------
  // 6c. persistEntry: feedback 'hard' but empty errorNote → 'unreviewed'
  // -------------------------------------------------------------------------
  it('logs reviewState=unreviewed when feedback is hard but errorNote is empty', async () => {
    const p = usePractice()
    await p.start()
    const result = await p.persistEntry({
      pickIndex: 0,
      sentence: '나는 학생이에요.',
      feedback: 'hard',
      errorNote: '   ', // whitespace-only counts as empty
    })
    expect(result).not.toBeNull()
    expect(add.mock.calls[0][0]).toMatchObject({ feedback: 'hard', reviewState: 'unreviewed' })
  })

  // -------------------------------------------------------------------------
  // 6d. persistEntry: returns null when there is no session
  // -------------------------------------------------------------------------
  it('persistEntry returns null when no session is active', async () => {
    const p = usePractice()
    // Not started → session is null.
    const result = await p.persistEntry({
      pickIndex: 0,
      sentence: '',
      feedback: 'easy',
      errorNote: null,
    })
    expect(result).toBeNull()
    expect(add).not.toHaveBeenCalled()
  })

  // -------------------------------------------------------------------------
  // 7a. reset() clears session and error
  // -------------------------------------------------------------------------
  it('reset clears session and error', async () => {
    // First produce an error state.
    mockActiveContexts = [{ id: 'ctx-1', name: '직장' }]
    const p = usePractice()
    await p.start()
    expect(p.error.value).toBe('practice.no_contexts')
    p.reset()
    expect(p.error.value).toBeNull()
    expect(p.session.value).toBeNull()
  })

  // -------------------------------------------------------------------------
  // 7b. completed is false when there is no session
  // -------------------------------------------------------------------------
  it('completed is false with no active session', () => {
    const p = usePractice()
    expect(p.completed.value).toBe(false)
  })

  // -------------------------------------------------------------------------
  // Accessor helpers: grammarOf / currentContextOf
  // -------------------------------------------------------------------------
  it('grammarOf returns the correct Grammar for a pick index', async () => {
    const p = usePractice()
    await p.start()
    // Pick 0 exists — verify it returns one of the grammar items.
    const g = p.grammarOf(0)
    expect(g).not.toBeNull()
    expect(GRAMMAR_ITEMS).toContainEqual(g)
  })

  it('currentContextOf returns a valid context for a pick index', async () => {
    const p = usePractice()
    await p.start()
    const ctx = p.currentContextOf(0)
    expect(ctx).not.toBeNull()
    expect(MOCK_CONTEXTS).toContainEqual(ctx)
  })

  it('grammarOf returns null when there is no session', () => {
    const p = usePractice()
    expect(p.grammarOf(0)).toBeNull()
  })

  it('currentContextOf returns null when there is no session', () => {
    const p = usePractice()
    expect(p.currentContextOf(0)).toBeNull()
  })
})
