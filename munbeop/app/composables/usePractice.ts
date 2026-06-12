import type { Context, Feedback, Grammar, LogEntry, ReviewState } from '~/lib/domain'
import {
  advanceProgress,
  createSession,
  filterPoolByDeck,
  isSessionComplete,
  type Session,
} from '~/lib/practice'
import { pickRandomFrom } from '~/lib/srs'
import { useContextsStore } from '~/stores/contexts'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

type PracticeSession = Session<number, Context>

export function usePractice() {
  const grammarStore = useGrammarStore()
  const contextsStore = useContextsStore()
  const srsStore = useSrsStore()
  const logStore = useLogStore()
  const route = useRoute()
  const { t } = useI18n()

  const session = ref<PracticeSession | null>(null)
  const error = ref<string | null>(null)

  async function start(opts?: { deckId?: string | null }) {
    error.value = null
    try {
      const activeContexts = contextsStore.active
      if (activeContexts.length < 3) {
        error.value = t('practice.no_contexts')
        return
      }

      // Focused round: ?focus=<ko> forces a single-grammar session — 3 picks
      // of the same grammar × 3 random contexts each. Triggered by the
      // library study sheet's "Practice this now" CTA. An explicit deck
      // pick always wins over a stale focus param still sitting in the
      // URL (e.g. after restarting a completed focused round).
      const explicitDeckPick = opts?.deckId !== undefined
      const rawFocus = explicitDeckPick ? undefined : route.query.focus
      const focusKo = typeof rawFocus === 'string' && rawFocus ? rawFocus : null
      const focusIdx = focusKo
        ? grammarStore.items.findIndex((g) => g.ko === focusKo)
        : -1

      if (focusIdx >= 0) {
        session.value = {
          picks: [0, 1, 2].map(() => ({
            grammarIdx: focusIdx,
            contexts: pickRandomFrom(activeContexts, 3),
            progress: 0,
          })),
        }
        await srsStore.markSeen(grammarStore.items[focusIdx]!.ko)
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
      })
      // Mark every picked grammar as seen — runs in parallel against storage.
      await Promise.all(
        session.value.picks.map((pick) =>
          srsStore.markSeen(grammarStore.items[pick.grammarIdx]!.ko),
        ),
      )
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

  async function persistEntry(p: {
    pickIndex: number
    sentence: string
    feedback: Feedback
    errorNote: string | null
  }): Promise<LogEntry | null> {
    const s = session.value
    if (!s) return null
    const grammar = grammarOf(p.pickIndex)
    const ctx = currentContextOf(p.pickIndex)
    if (!grammar || !ctx) return null
    const hasNote = p.errorNote !== null && p.errorNote.trim().length > 0
    const reviewState: ReviewState = p.feedback === 'hard' && hasNote ? 'incorrect' : 'unreviewed'
    const entry = await logStore.add({
      ko: grammar.ko,
      sentence: p.sentence,
      feedback: p.feedback,
      errorNote: hasNote ? p.errorNote : null,
      reviewState,
      contextId: ctx.id,
      contextName: ctx.name,
    })
    await srsStore.recalculate(grammar.ko)
    advanceProgress(s, p.pickIndex)
    return entry
  }

  function reset() {
    session.value = null
    error.value = null
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
