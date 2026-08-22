// app/composables/useClozeDrill.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, optionsFor, scoreOf, itemId, type DrillResult } from '~/lib/cloze'
import type { ClozeItem } from '~/lib/domain'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useActivityStore } from '~/stores/activity'
import { useAuthStore } from '~/stores/auth'
import { useStudySession } from '~/composables/useStudySession'
import type { PracticeSaveStatus } from '~/lib/practice/persistence'

export type ClozePhase = 'question' | 'right' | 'wrong' | 'done'
export type ClozeRunMode = 'normal' | 'replay'

const LAB_CONTEXT = { id: 'cloze-lab', name: '빈칸 LAB' }
const ROUND_SIZE = 8
const CREDIT_THRESHOLD = 0.7

export function useClozeDrill() {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const activity = useActivityStore()
  const auth = useAuthStore()
  const studySession = useStudySession()
  const { t } = useI18n()

  const sessionItems = ref<ClozeItem[]>([])
  const displayOptions = ref<string[]>([])
  const runMode = ref<ClozeRunMode>('normal')
  const index = ref(0)
  const phase = ref<ClozePhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])
  const saveStatus = ref<PracticeSaveStatus>('idle')
  const pendingMistake = ref<{ id: number; item: ClozeItem; choice: string } | null>(null)
  const pendingCredits = ref<Array<{ id: number; item: ClozeItem }>>([])
  const completionPrepared = ref(false)
  let runOwnerUserId: string | null = null
  let runGeneration = 0

  function runStillOwned(ownerUserId = runOwnerUserId, generation = runGeneration): boolean {
    return (
      (auth.user?.id ?? null) === ownerUserId &&
      runGeneration === generation &&
      studySession.isCurrent()
    )
  }

  const item = computed<ClozeItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) =>
      results.value.some((r) => r.itemId === itemId(i) && !r.correct),
    ),
  )
  const saveBlocked = computed(() => saveStatus.value === 'saving' || saveStatus.value === 'error')

  function shuffleOptions() {
    displayOptions.value = shuffle(optionsFor(item.value))
  }
  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
    saveStatus.value = 'idle'
    pendingMistake.value = null
    pendingCredits.value = []
    completionPrepared.value = false
  }

  async function start(kos: string[]) {
    studySession.begin()
    if (saveBlocked.value) return
    runGeneration += 1
    runOwnerUserId = auth.user?.id ?? null
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    runMode.value = 'normal'
    sessionItems.value = buildRound(kos, ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) shuffleOptions()
    const markSeenResults = await Promise.allSettled(
      [...new Set(sessionItems.value.map((i) => i.ko))].map((ko) => srsStore.markSeen(ko)),
    )
    if (!runStillOwned(ownerUserId, generation)) return
    if (markSeenResults.some((result) => result.status === 'rejected')) {
      console.error('cloze: one or more mark-seen writes failed')
    }
  }

  function replayFailed() {
    if (saveBlocked.value) return
    const failed = failedItems.value
    if (failed.length === 0) return
    runGeneration += 1
    runOwnerUserId = auth.user?.id ?? null
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    shuffleOptions()
  }

  async function answer(choice: string) {
    if (phase.value !== 'question' || saveStatus.value === 'saving' || !runStillOwned()) return
    picked.value = choice
    const correct = choice === item.value.answer
    results.value.push({ itemId: itemId(item.value), ko: item.value.ko, correct })
    phase.value = correct ? 'right' : 'wrong'
    if (runStillOwned()) void activity.record('cloze')
    if (!correct && runMode.value === 'normal') {
      pendingMistake.value = { id: logStore.createEntryId(), item: item.value, choice }
      await persistPendingMistake()
    }
  }

  async function next() {
    if (
      phase.value === 'question' ||
      phase.value === 'done' ||
      saveStatus.value === 'saving' ||
      saveStatus.value === 'error'
    )
      return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    phase.value = 'question'
    picked.value = null
    saveStatus.value = 'idle'
    pendingMistake.value = null
    shuffleOptions()
  }

  /** Credit easy/correct per ko cleared at round end (normal mode only), then recalculate. */
  async function finish() {
    if (saveStatus.value === 'saving') return
    if (runMode.value !== 'normal') return
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    if (!runStillOwned(ownerUserId, generation)) return
    // Build this queue only once. Successfully written entries are shifted so
    // retrying after a partial failure cannot duplicate earlier credits.
    if (!completionPrepared.value) {
      const credits: Array<{ id: number; item: ClozeItem }> = []
      const byKo = new Map<
        string,
        { correct: number; total: number; firstCorrect: ClozeItem | null }
      >()
      for (const it of sessionItems.value) {
        const r = results.value.find((x) => x.itemId === itemId(it))
        if (!r) continue
        const g = byKo.get(it.ko) ?? { correct: 0, total: 0, firstCorrect: null }
        g.total += 1
        if (r.correct) {
          g.correct += 1
          if (!g.firstCorrect) g.firstCorrect = it
        }
        byKo.set(it.ko, g)
      }
      for (const g of byKo.values()) {
        if (g.firstCorrect && g.total > 0 && g.correct / g.total >= CREDIT_THRESHOLD) {
          credits.push({ id: logStore.createEntryId(), item: g.firstCorrect })
        }
      }
      pendingCredits.value = credits
      completionPrepared.value = true
    }

    if (pendingCredits.value.length === 0) {
      saveStatus.value = 'idle'
      return
    }
    saveStatus.value = 'saving'
    while (pendingCredits.value.length > 0) {
      if (!runStillOwned(ownerUserId, generation)) return
      const credit = pendingCredits.value[0]!
      try {
        await logStore.add(
          {
            ko: credit.item.ko,
            sentence: credit.item.sentence.replace('{}', credit.item.answer),
            feedback: 'easy',
            errorNote: null,
            reviewState: 'correct',
            contextId: LAB_CONTEXT.id,
            contextName: LAB_CONTEXT.name,
          },
          credit.id,
        )
        if (!runStillOwned(ownerUserId, generation)) return
      } catch (error) {
        console.error('cloze: round credit write failed', error)
        saveStatus.value = 'error'
        return
      }
      pendingCredits.value.shift()
    }
    saveStatus.value = 'saved'
  }

  async function persistPendingMistake(): Promise<boolean> {
    const pending = pendingMistake.value
    if (!pending || saveStatus.value === 'saving') return false
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    if (!runStillOwned(ownerUserId, generation)) return false
    saveStatus.value = 'saving'
    try {
      await logStore.add(
        {
          ko: pending.item.ko,
          sentence: pending.item.sentence.replace('{}', pending.item.answer),
          feedback: 'hard',
          errorNote: t('cloze.diary_note', {
            chosen: pending.choice,
            correct: pending.item.answer,
          }),
          errorDimension: pending.item.errorDimension ?? 'other',
          reviewState: 'incorrect',
          contextId: LAB_CONTEXT.id,
          contextName: LAB_CONTEXT.name,
        },
        pending.id,
      )
      if (!runStillOwned(ownerUserId, generation)) return false
    } catch (error) {
      console.error('cloze: diary write failed', error)
      saveStatus.value = 'error'
      return false
    }
    pendingMistake.value = null
    saveStatus.value = 'saved'
    return true
  }

  async function retrySave() {
    if (saveStatus.value !== 'error') return
    if (pendingMistake.value) await persistPendingMistake()
    else await finish()
  }

  return {
    sessionItems,
    displayOptions,
    runMode,
    index,
    phase,
    picked,
    item,
    score,
    failedItems,
    saveStatus,
    saveBlocked,
    start,
    replayFailed,
    answer,
    next,
    finish,
    retrySave,
  }
}
