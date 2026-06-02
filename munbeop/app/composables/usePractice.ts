import type { Context, Feedback, Grammar, LogEntry, ReviewState } from '~/lib/domain'
import { advanceProgress, createSession, isSessionComplete, type Session } from '~/lib/practice'
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
  const { t } = useI18n()

  const session = ref<PracticeSession | null>(null)
  const error = ref<string | null>(null)

  function start() {
    error.value = null
    try {
      const pool = grammarStore.activeIndices
      const activeContexts = contextsStore.active
      if (pool.length < 3) {
        error.value = t('practice.no_grammars')
        return
      }
      if (activeContexts.length < 3) {
        error.value = t('practice.no_contexts')
        return
      }
      session.value = createSession<number, Context>({
        grammarPool: pool,
        contextPool: activeContexts,
        weightOf: (idx) => srsStore.weightFor(grammarStore.items[idx]!.ko),
      })
      for (const pick of session.value.picks) {
        srsStore.markSeen(grammarStore.items[pick.grammarIdx]!.ko)
      }
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

  function persistEntry(p: {
    pickIndex: number
    sentence: string
    feedback: Feedback
    errorNote: string | null
  }): LogEntry | null {
    const s = session.value
    if (!s) return null
    const grammar = grammarOf(p.pickIndex)
    const ctx = currentContextOf(p.pickIndex)
    if (!grammar || !ctx) return null
    const hasNote = p.errorNote !== null && p.errorNote.trim().length > 0
    const reviewState: ReviewState = p.feedback === 'hard' && hasNote ? 'incorrect' : 'unreviewed'
    const entry = logStore.add({
      ko: grammar.ko,
      sentence: p.sentence,
      feedback: p.feedback,
      errorNote: hasNote ? p.errorNote : null,
      reviewState,
      contextId: ctx.id,
      contextName: ctx.name,
    })
    srsStore.recalculate(grammar.ko)
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
