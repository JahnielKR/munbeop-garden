import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { choicesFor, generateItems } from '~/lib/numbers-market'
import type { MarketItem, NumberDomain } from '~/lib/domain'
import { useActivityStore } from '~/stores/activity'
import { useSettingsStore } from '~/stores/settings'
import { useAuthStore } from '~/stores/auth'
import { useNumberMarketMaster } from '~/composables/useNumberMarketMaster'
import type { PracticeSaveStatus } from '~/lib/practice/persistence'

export type SpeedPhase = 'playing' | 'done'
/** A deck id: a NumberDomain, or 'mixed' for the all-domains blitz. */
export type SpeedDeckId = string

const DURATION = 60
/** Items generated per refill — large enough that a 60s run rarely repeats. */
const BATCH = 60
/** A lucky first tap is not evidence of mastery. Match the eight-prompt rounds
 * used by Learn and Dictation before a Speed run can clear a domain. */
export const MIN_SPEED_MASTERY_ATTEMPTS = 8
const MASTERY_ACCURACY = 0.7

interface PendingSpeedSave {
  ownerUserId: string | null
  deckId: SpeedDeckId
  score: number
  accuracy: number
  masterySaved: boolean
  bestSaved: boolean
  isRecord: boolean
}

export function useNumberSpeed(master = useNumberMarketMaster()) {
  const activity = useActivityStore()
  // Best score is account-synced (was a global localStorage key that leaked
  // across accounts on a shared device).
  const settings = useSettingsStore()
  const auth = useAuthStore()

  const deckId = ref<SpeedDeckId>('mixed')
  const queue = ref<MarketItem[]>([])
  const cursor = ref(0)
  const choices = ref<string[]>([])
  const phase = ref<SpeedPhase>('playing')
  const timeLeft = ref(DURATION)
  const score = ref(0)
  const combo = ref(0)
  const bestStreak = ref(0)
  const lastCorrect = ref<boolean | null>(null)
  // Monotonic answer counter — drives the screen-reader verdict announcer so two
  // correct answers in a row still re-announce (the live-region text repeats).
  const answered = ref(0)
  const newRecord = ref(false)
  const saveStatus = ref<PracticeSaveStatus>('idle')
  const saving = computed(() => saveStatus.value === 'saving')
  const saveError = computed(() => saveStatus.value === 'error')
  const locked = computed(() => saving.value || saveError.value)
  let pendingSave: PendingSpeedSave | null = null
  let saveInFlight: Promise<boolean> | null = null
  let runOwnerUserId: string | null = null

  const item = computed<MarketItem>(() => queue.value[cursor.value]!)
  const bestScore = computed(() => settings.numberSpeedBest[deckId.value] ?? 0)

  function refillQueue() {
    // A fresh procedurally-generated batch every refill keeps the blitz
    // genuinely random instead of cycling a tiny fixed deck.
    const deck = deckId.value === 'mixed' ? 'mixed' : (deckId.value as NumberDomain)
    queue.value = generateItems(deck, BATCH)
    cursor.value = 0
  }
  function loadChoices() {
    // Distractors come from the current batch → same-domain siblings.
    choices.value = choicesFor(item.value, queue.value, shuffle)
  }

  function start(id: SpeedDeckId) {
    if (locked.value || !master.resetSaveStatus()) return false
    deckId.value = id
    runOwnerUserId = auth.user?.id ?? null
    phase.value = 'playing'
    timeLeft.value = DURATION
    score.value = 0
    combo.value = 0
    bestStreak.value = 0
    lastCorrect.value = null
    answered.value = 0
    newRecord.value = false
    saveStatus.value = 'idle'
    pendingSave = null
    refillQueue()
    loadChoices()
    return true
  }

  function advance() {
    cursor.value += 1
    if (cursor.value >= queue.value.length) refillQueue()
    loadChoices()
  }

  function answer(choice: string) {
    if (phase.value !== 'playing') return
    const correct = choice === item.value.answer
    lastCorrect.value = correct
    answered.value += 1
    if (correct) {
      score.value += 1
      combo.value += 1
      if (combo.value > bestStreak.value) bestStreak.value = combo.value
    } else {
      combo.value = 0
    }
    if ((auth.user?.id ?? null) === runOwnerUserId) void activity.record()
    advance()
  }

  function finish(): Promise<boolean> {
    if (phase.value === 'done') {
      return saveInFlight ?? Promise.resolve(saveStatus.value !== 'error')
    }
    phase.value = 'done'
    const accuracy = answered.value > 0 ? score.value / answered.value : 0
    const isRecord = score.value > 0 && score.value > bestScore.value
    const qualifiesForMastery = deckId.value !== 'mixed'
      && answered.value >= MIN_SPEED_MASTERY_ATTEMPTS
      && accuracy >= MASTERY_ACCURACY

    pendingSave = {
      ownerUserId: runOwnerUserId,
      deckId: deckId.value,
      score: score.value,
      accuracy,
      masterySaved: !qualifiesForMastery,
      bestSaved: !isRecord,
      isRecord,
    }
    // Never flash a trophy for an optimistic best. It becomes visible only
    // after every Settings write for this result has completed.
    newRecord.value = false
    if (pendingSave.masterySaved && pendingSave.bestSaved) {
      pendingSave = null
      return Promise.resolve(true)
    }
    return persistPending()
  }

  function persistPending(): Promise<boolean> {
    if (saveInFlight) return saveInFlight
    const task = pendingSave
    if (!task) return Promise.resolve(true)

    const taskStillOwned = () => (auth.user?.id ?? null) === task.ownerUserId
    const abandonStaleTask = () => {
      if (pendingSave === task) pendingSave = null
      saveStatus.value = 'idle'
      newRecord.value = false
      return false
    }
    if (!taskStillOwned()) return Promise.resolve(abandonStaleTask())

    saveStatus.value = 'saving'
    const operation = (async () => {
      try {
        // Both operations update one settings blob. Awaiting them in sequence,
        // together with the store's FIFO snapshot queue, prevents clobbering.
        if (!task.masterySaved) {
          const mastered = master.saveStatus.value === 'error'
            ? await master.retrySave()
            : await master.recordRound(task.deckId, task.accuracy)
          if (!taskStillOwned()) return abandonStaleTask()
          if (!mastered) {
            saveStatus.value = 'error'
            return false
          }
          task.masterySaved = true
        }
        if (!task.bestSaved) {
          if (!taskStillOwned()) return abandonStaleTask()
          await settings.recordSpeedBest(task.deckId, task.score)
          if (!taskStillOwned()) return abandonStaleTask()
          task.bestSaved = true
        }
        if (pendingSave === task) pendingSave = null
        newRecord.value = task.isRecord
        saveStatus.value = 'saved'
        return true
      } catch (error) {
        console.error('number-market: speed result failed to save', error)
        saveStatus.value = 'error'
        return false
      }
    })()
    saveInFlight = operation
    void operation.then(() => {
      if (saveInFlight === operation) saveInFlight = null
    })
    return operation
  }

  function retrySave(): Promise<boolean> {
    if (saveStatus.value !== 'error') return Promise.resolve(!pendingSave)
    return persistPending()
  }

  function tick() {
    if (phase.value !== 'playing') return
    timeLeft.value -= 1
    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      void finish()
    }
  }

  return {
    deckId,
    queue,
    cursor,
    choices,
    phase,
    timeLeft,
    score,
    combo,
    bestStreak,
    lastCorrect,
    answered,
    newRecord,
    master,
    saveStatus,
    saving,
    saveError,
    locked,
    item,
    bestScore,
    start,
    answer,
    tick,
    finish,
    retrySave,
  }
}
