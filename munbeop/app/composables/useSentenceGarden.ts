import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { selectRounds } from '~/lib/sentence-garden/select'
import { checkOrder } from '~/lib/sentence-garden/check'
import type { SentenceGardenRound } from '~/lib/sentence-garden/build'
import { SENTENCE_GARDEN_POOL } from '~/lib/sentence-garden/pool'
import { useExampleAudio } from '~/composables/useExampleAudio'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useActivityStore } from '~/stores/activity'
import { useAuthStore } from '~/stores/auth'

export type SGPhase = 'placing' | 'right' | 'wrong' | 'done'
export type SGRunMode = 'normal' | 'replay'
export interface SGCard { id: number; text: string }

const LAB_CONTEXT = { id: 'sentence-garden-lab', name: '문장 정원 LAB' }
const ROUND_SIZE = 8
const CREDIT_THRESHOLD = 0.7
const POOL = SENTENCE_GARDEN_POOL

interface SGResult { index: number; sentence: string; ko: string; correct: boolean }

interface PendingMistakeWrite {
  logId: number
  round: SentenceGardenRound
  logSaved: boolean
  recalculated: boolean
}

interface PendingCreditWrite {
  logId: number | null
  ko: string
  firstCorrect: SentenceGardenRound | null
  logSaved: boolean
  recalculated: boolean
}

export function useSentenceGarden() {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const activity = useActivityStore()
  const auth = useAuthStore()
  const { playExample } = useExampleAudio()

  const sessionItems = ref<SentenceGardenRound[]>([])
  const runMode = ref<SGRunMode>('normal')
  const index = ref(0)
  const phase = ref<SGPhase>('placing')
  const tray = ref<SGCard[]>([])
  const placed = ref<SGCard[]>([])
  const results = ref<SGResult[]>([])
  const saving = ref(false)
  const saveError = ref(false)

  let pendingMistake: PendingMistakeWrite | null = null
  let pendingCredits = new Map<string, PendingCreditWrite>()
  let creditsPrepared = false
  let markSeenPending = new Set<string>()
  let markSeenInFlight: Promise<void> | null = null
  let persistInFlight: Promise<boolean> | null = null
  let runOwnerUserId: string | null = null
  let runGeneration = 0

  function runStillOwned(ownerUserId = runOwnerUserId, generation = runGeneration): boolean {
    return (auth.user?.id ?? null) === ownerUserId && runGeneration === generation
  }

  const item = computed<SentenceGardenRound>(() => sessionItems.value[index.value]!)
  const score = computed(() => ({
    correct: results.value.filter((result) => result.correct).length,
    total: results.value.length,
  }))
  const failedItems = computed(() => {
    const failed = new Set(results.value.filter((result) => !result.correct).map((result) => result.index))
    return sessionItems.value.filter((_round, roundIndex) => failed.has(roundIndex))
  })
  const canCheck = computed(
    () => !!item.value && placed.value.length === item.value.answer.length,
  )

  function loadRound() {
    tray.value = item.value.cards.map((text, id) => ({ id, text }))
    placed.value = []
    phase.value = 'placing'
  }

  function resetRound() {
    index.value = 0
    results.value = []
    loadRound()
  }

  async function saveMarkSeenPending(
    ownerUserId = runOwnerUserId,
    generation = runGeneration,
  ): Promise<void> {
    if (markSeenInFlight) return markSeenInFlight
    if (markSeenPending.size === 0) return
    const pending = markSeenPending

    const batch = (async () => {
      let firstError: unknown = null
      for (const ko of [...pending]) {
        if (!runStillOwned(ownerUserId, generation)) return
        try {
          await srsStore.markSeen(ko)
          if (!runStillOwned(ownerUserId, generation)) return
          pending.delete(ko)
        } catch (error) {
          firstError ??= error
        }
      }
      if (firstError) throw firstError
    })()
    markSeenInFlight = batch
    try {
      await batch
    } finally {
      if (markSeenInFlight === batch) markSeenInFlight = null
    }
  }

  function reportSaveFailure(message: string, error: unknown) {
    saveError.value = true
    console.error(message, error)
  }

  function start(kos: string[]) {
    runGeneration += 1
    runOwnerUserId = auth.user?.id ?? null
    runMode.value = 'normal'
    sessionItems.value = selectRounds(POOL, kos, ROUND_SIZE)
    if (sessionItems.value.length) resetRound()

    saving.value = false
    saveError.value = false
    pendingMistake = null
    pendingCredits = new Map()
    creditsPrepared = false
    markSeenPending = new Set(sessionItems.value.map((round) => round.ko))
    markSeenInFlight = null
    persistInFlight = null

    // Starting remains synchronous. Failed background writes stay pending and
    // become visible/retryable instead of disappearing into the console.
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    void saveMarkSeenPending(ownerUserId, generation).catch((error) => {
      if (!runStillOwned(ownerUserId, generation)) return
      reportSaveFailure('sentence-garden: mark-seen failed', error)
    })
  }

  function place(card: SGCard) {
    if (phase.value !== 'placing') return
    const at = tray.value.findIndex((candidate) => candidate.id === card.id)
    if (at === -1) return
    tray.value.splice(at, 1)
    placed.value.push(card)
  }

  function removeAt(placedIndex: number) {
    if (phase.value !== 'placing') return
    const [card] = placed.value.splice(placedIndex, 1)
    if (card) tray.value.push(card)
  }

  function check() {
    if (phase.value !== 'placing' || !canCheck.value) return
    const correct = checkOrder(
      placed.value.map((card) => card.text),
      item.value.answer,
    )
    results.value.push({
      index: index.value,
      sentence: item.value.sentence,
      ko: item.value.ko,
      correct,
    })
    phase.value = correct ? 'right' : 'wrong'
    if (runStillOwned()) void activity.record()
    if (correct) {
      playExample(item.value.sentence)
    } else if (runMode.value === 'normal') {
      pendingMistake = {
        logId: logStore.createEntryId(),
        round: item.value,
        logSaved: false,
        recalculated: false,
      }
      void persistPending()
    }
  }

  async function next() {
    if (phase.value === 'placing' || phase.value === 'done') return
    if (persistInFlight) await persistInFlight
    if (saveError.value) return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    loadRound()
  }

  function replayFailed() {
    if (saving.value || saveError.value) return
    const failed = failedItems.value
    if (failed.length === 0) return
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
  }

  function prepareCredits() {
    if (creditsPrepared || runMode.value !== 'normal') return
    creditsPrepared = true
    const byKo = new Map<
      string,
      { correct: number; total: number; firstCorrect: SentenceGardenRound | null }
    >()
    for (let roundIndex = 0; roundIndex < sessionItems.value.length; roundIndex++) {
      const round = sessionItems.value[roundIndex]!
      const result = results.value.find((candidate) => candidate.index === roundIndex)
      if (!result) continue
      const group = byKo.get(round.ko) ?? { correct: 0, total: 0, firstCorrect: null }
      group.total += 1
      if (result.correct) {
        group.correct += 1
        group.firstCorrect ??= round
      }
      byKo.set(round.ko, group)
    }

    for (const [ko, group] of byKo) {
      const shouldCredit = !!group.firstCorrect
        && group.total > 0
        && group.correct / group.total >= CREDIT_THRESHOLD
      pendingCredits.set(ko, {
        logId: shouldCredit ? logStore.createEntryId() : null,
        ko,
        firstCorrect: group.firstCorrect,
        logSaved: !shouldCredit,
        recalculated: false,
      })
    }
  }

  async function logMistake(round: SentenceGardenRound, stableId: number) {
    await logStore.add({
      ko: round.ko,
      sentence: round.sentence,
      feedback: 'hard',
      errorNote: null,
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    }, stableId)
  }

  async function saveMistakeWrite(ownerUserId: string | null, generation: number) {
    if (!runStillOwned(ownerUserId, generation)) return
    if (!pendingMistake) return
    if (!pendingMistake.logSaved) {
      await logMistake(pendingMistake.round, pendingMistake.logId)
      if (!runStillOwned(ownerUserId, generation)) return
      pendingMistake.logSaved = true
    }
    if (!pendingMistake.recalculated) {
      await srsStore.recalculate(pendingMistake.round.ko)
      if (!runStillOwned(ownerUserId, generation)) return
      pendingMistake.recalculated = true
    }
    pendingMistake = null
  }

  async function saveCreditWrites(ownerUserId: string | null, generation: number) {
    let firstError: unknown = null
    for (const [ko, task] of pendingCredits) {
      if (!runStillOwned(ownerUserId, generation)) return
      try {
        if (!task.logSaved && task.firstCorrect && task.logId !== null) {
          await logStore.add({
            ko,
            sentence: task.firstCorrect.sentence,
            feedback: 'easy',
            errorNote: null,
            reviewState: 'correct',
            contextId: LAB_CONTEXT.id,
            contextName: LAB_CONTEXT.name,
          }, task.logId)
          if (!runStillOwned(ownerUserId, generation)) return
          task.logSaved = true
        }
        if (!task.recalculated) {
          await srsStore.recalculate(ko)
          if (!runStillOwned(ownerUserId, generation)) return
          task.recalculated = true
        }
        pendingCredits.delete(ko)
      } catch (error) {
        firstError ??= error
        console.error('sentence-garden: round credit failed to save', error)
      }
    }
    if (firstError) throw firstError
  }

  async function runPersist(): Promise<boolean> {
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    if (!runStillOwned(ownerUserId, generation)) return false
    saving.value = true
    saveError.value = false
    try {
      // Preserve write order: markSeen carries a pre-round SRS snapshot and
      // must settle before any recalculation. Only failed stages remain pending.
      await saveMarkSeenPending(ownerUserId, generation)
      if (!runStillOwned(ownerUserId, generation)) return false
      await saveMistakeWrite(ownerUserId, generation)
      if (!runStillOwned(ownerUserId, generation)) return false
      await saveCreditWrites(ownerUserId, generation)
      if (!runStillOwned(ownerUserId, generation)) return false
      return true
    } catch (error) {
      if (!runStillOwned(ownerUserId, generation)) return false
      reportSaveFailure('sentence-garden: progress failed to save', error)
      return false
    } finally {
      if (generation === runGeneration) saving.value = false
    }
  }

  function persistPending(): Promise<boolean> {
    if (persistInFlight) return persistInFlight
    const task = runPersist()
    persistInFlight = task
    void task.then(() => {
      if (persistInFlight === task) persistInFlight = null
    })
    return task
  }

  /** Credit easy/correct per grammar at round end. The task stages remain
   * pending until success, so Retry is idempotent after a partial save. */
  async function finish(): Promise<boolean> {
    if (runMode.value !== 'normal') return true
    prepareCredits()
    return persistPending()
  }

  async function retrySave(): Promise<boolean> {
    return persistPending()
  }

  return {
    sessionItems,
    runMode,
    index,
    phase,
    tray,
    placed,
    results,
    saving,
    saveError,
    item,
    score,
    failedItems,
    canCheck,
    start,
    place,
    removeAt,
    check,
    next,
    replayFailed,
    finish,
    retrySave,
  }
}
