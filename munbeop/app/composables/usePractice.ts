import type { Context, ErrorDimension, Feedback, Grammar, LogEntry, ReviewState } from '~/lib/domain'
import {
  advanceProgress,
  createSession,
  filterPoolByDeck,
  filterPoolByCustomDeck,
  isSessionComplete,
  type Session,
} from '~/lib/practice'
import { pickRandomFrom } from '~/lib/srs'
import { useContextsStore, MIN_ACTIVE_CONTEXTS } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useLeeches } from '~/composables/useLeeches'
import { useActivityStore } from '~/stores/activity'
import { useAppStatus } from '~/stores/appStatus'
import { useAuthStore } from '~/stores/auth'

type PracticeSession = Session<number, Context>

export function usePractice() {
  const grammarStore = useGrammarStore()
  const contextsStore = useContextsStore()
  const srsStore = useSrsStore()
  const logStore = useLogStore()
  const activity = useActivityStore()
  const auth = useAuthStore()
  const route = useRoute()
  const { t } = useI18n()
  const { leechKos } = useLeeches()

  const session = ref<PracticeSession | null>(null)
  const error = ref<string | null>(null)

  type PersistParams = {
    pickIndex: number
    sentence: string
    feedback: Feedback
    errorNote: string | null
    errorDimension?: ErrorDimension | null
  }

  type PersistTask = PersistParams & {
    ownerUserId: string
    ownerSession: PracticeSession
    grammar: Grammar
    context: Context
    stableId: number
  }

  // Three cards are interactive at once. Serialize their save pipelines so an
  // SRS recalculation can never observe a sibling's optimistic log row that
  // later rolls back.
  let persistenceTail: Promise<void> = Promise.resolve()
  const pendingEntryIds = new Map<number, number>()
  let sessionOwnerUserId: string | null = null

  async function start(opts?: { deckId?: string | null; customDeckGrammarKos?: readonly string[] }) {
    error.value = null
    // Never start against the transient anonymous/noop stores used while the
    // persisted session is restoring. INITIAL_SESSION marks appStatus ready
    // only after the authenticated cloud pull completes; the banner's retry
    // does the same after a hydration failure.
    const dataStatus = useAppStatus().status
    if (!auth.ready || !auth.user || dataStatus !== 'ready') {
      error.value = t('errors.data_failed')
      return
    }
    sessionOwnerUserId = auth.user.id
    pendingEntryIds.clear()
    try {
      const activeContexts = contextsStore.active
      if (activeContexts.length < MIN_ACTIVE_CONTEXTS) {
        error.value = t('practice.no_contexts')
        return
      }

      // Focused round: ?focus=<ko> forces a single-grammar session — 3 picks
      // of the same grammar × 3 random contexts each. Triggered by the
      // library study sheet's "Practice this now" CTA. An explicit deck
      // pick always wins over a stale focus param still sitting in the
      // URL (e.g. after restarting a completed focused round).
      const explicitDeckPick =
        opts?.deckId !== undefined || opts?.customDeckGrammarKos !== undefined
      const rawFocus = explicitDeckPick ? undefined : route.query.focus
      const focusKo = typeof rawFocus === 'string' && rawFocus ? rawFocus : null
      const focusIdx = focusKo
        ? grammarStore.items.findIndex((g) => g.ko === focusKo)
        : -1

      // A malformed or stale deep link must not silently become an unrelated
      // random draw.
      if (focusKo && focusIdx < 0) {
        error.value = t('practice.no_grammars')
        return
      }

      if (focusIdx >= 0) {
        session.value = {
          picks: [0, 1, 2].map(() => ({
            grammarIdx: focusIdx,
            contexts: pickRandomFrom(activeContexts, 3),
            progress: 0,
          })),
        }
        return
      }

      // Custom deck: draw from the user's hand-picked grammar set. Maps each
      // ko to its catalog index and bypasses the Library excludedDeckIds gate
      // (a custom deck is an explicit curation). The "min 6 to play" rule is a
      // picker gate; here only the engine's hard floor of 3 applies.
      if (opts?.customDeckGrammarKos) {
        const koToIdx = new Map(grammarStore.items.map((g, i) => [g.ko, i]))
        const pool = filterPoolByCustomDeck(opts.customDeckGrammarKos, (ko) => koToIdx.get(ko))
        if (pool.length < 3) {
          error.value = t('practice.no_grammars')
          return
        }
        session.value = createSession<number, Context>({
          grammarPool: pool,
          contextPool: activeContexts,
          weightOf: (idx) => srsStore.weightFor(grammarStore.items[idx]!.ko),
        })
        return
      }

      // Deck draw: the card game narrows the pool to one TOPIK deck.
      // `null`/omitted keeps every active deck (the "all levels" mat).
      const pool = filterPoolByDeck(
        grammarStore.activeIndices,
        (idx) => grammarStore.items[idx]?.deckId,
        opts?.deckId ?? null,
      )
      if (pool.length < 3) {
        error.value = t('practice.no_grammars')
        return
      }
      session.value = createSession<number, Context>({
        grammarPool: pool,
        contextPool: activeContexts,
        weightOf: (idx) => srsStore.weightFor(grammarStore.items[idx]!.ko),
        // Stop a single leech from dominating the hand — at most one of the
        // three picks may be a leech (the SRS weight already over-draws them).
        capPredicate: (idx) => leechKos.value.has(grammarStore.items[idx]!.ko),
      })
      // Do not mark a card as seen merely because it was dealt. recalculate()
      // derives lastSeen from the first journal entry after real practice.
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  function grammarOf(pickIdx: number): Grammar | null {
    const s = session.value
    if (!s) return null
    const pick = s.picks[pickIdx]
    if (!pick) return null
    return grammarStore.items[pick.grammarIdx] ?? null
  }

  function currentContextOf(pickIdx: number): Context | null {
    const s = session.value
    if (!s) return null
    const pick = s.picks[pickIdx]
    if (!pick) return null
    return pick.contexts[pick.progress] ?? null
  }

  function taskStillOwned(task: PersistTask): boolean {
    return auth.user?.id === task.ownerUserId && session.value === task.ownerSession
  }

  async function persistEntryNow(p: PersistTask): Promise<LogEntry | null> {
    if (!taskStillOwned(p)) return null
    const hasNote = p.errorNote !== null && p.errorNote.trim().length > 0
    const reviewState: ReviewState = p.feedback === 'hard' && hasNote ? 'incorrect' : 'unreviewed'
    // The log write persists the learner's sentence — the thing we must never
    // lose. On a flaky mobile network (routine in Korea) the Supabase adapter
    // throws; bail WITHOUT advancing so the card keeps the sentence and the
    // caller can offer a retry, instead of silently dropping the answer.
    let entry: LogEntry
    try {
      entry = await logStore.add({
        ko: p.grammar.ko,
        sentence: p.sentence,
        feedback: p.feedback,
        errorNote: hasNote ? p.errorNote : null,
        errorDimension: p.errorDimension ?? null,
        reviewState,
        contextId: p.context.id,
        contextName: p.context.name,
      }, p.stableId)
    } catch (e) {
      console.error('persistEntry: log write failed', e)
      return null
    }
    if (!taskStillOwned(p)) return null
    pendingEntryIds.delete(p.pickIndex)
    // Fire-and-forget: the heatmap tick is intentionally decoupled so it never
    // blocks the answer. record() swallows transient cloud errors itself.
    void activity.record()
    // SRS recalc is secondary — the sentence is already saved. A failure here
    // must not lose that or block the card; SRS self-heals on the next answer
    // (recalculateMastery re-derives mastery from the full log each time).
    try {
      await srsStore.recalculate(p.grammar.ko)
    } catch (e) {
      console.error('persistEntry: SRS recalc failed', e)
    }
    if (!taskStillOwned(p)) return null
    advanceProgress(p.ownerSession, p.pickIndex)
    return entry
  }

  function persistEntry(p: PersistParams): Promise<LogEntry | null> {
    const ownerSession = session.value
    const ownerUserId = sessionOwnerUserId
    const grammar = grammarOf(p.pickIndex)
    const context = currentContextOf(p.pickIndex)
    if (!ownerSession || !ownerUserId || auth.user?.id !== ownerUserId || !grammar || !context) {
      return Promise.resolve(null)
    }
    const stableId = pendingEntryIds.get(p.pickIndex) ?? logStore.createEntryId()
    pendingEntryIds.set(p.pickIndex, stableId)
    // Capture every mutable lookup before entering the FIFO. A queued card must
    // never re-read account/session state after another user signs in.
    const task: PersistTask = {
      ...p,
      ownerUserId,
      ownerSession,
      grammar,
      context,
      stableId,
    }
    const job = persistenceTail.then(() => persistEntryNow(task))
    // A failed job must not poison the queue; later cards retain their own
    // independent save attempt.
    persistenceTail = job.then(() => undefined, () => undefined)
    return job
  }

  function reset() {
    session.value = null
    error.value = null
    pendingEntryIds.clear()
    sessionOwnerUserId = null
  }

  const completed = computed(() =>
    session.value ? isSessionComplete(session.value) : false,
  )

  return {
    session: readonly(session),
    error: readonly(error),
    completed,
    start,
    grammarOf,
    currentContextOf,
    persistEntry,
    reset,
  }
}
