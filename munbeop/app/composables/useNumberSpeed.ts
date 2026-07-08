import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { choicesFor, generateItems } from '~/lib/numbers-market'
import type { MarketItem, NumberDomain } from '~/lib/domain'
import { useActivityStore } from '~/stores/activity'
import { useSettingsStore } from '~/stores/settings'

export type SpeedPhase = 'playing' | 'done'
/** A deck id: a NumberDomain, or 'mixed' for the all-domains blitz. */
export type SpeedDeckId = string

const DURATION = 60
/** Items generated per refill — large enough that a 60s run rarely repeats. */
const BATCH = 60

export function useNumberSpeed() {
  const activity = useActivityStore()
  // Best score is account-synced (was a global localStorage key that leaked
  // across accounts on a shared device).
  const settings = useSettingsStore()

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
    deckId.value = id
    phase.value = 'playing'
    timeLeft.value = DURATION
    score.value = 0
    combo.value = 0
    bestStreak.value = 0
    lastCorrect.value = null
    answered.value = 0
    refillQueue()
    loadChoices()
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
    void activity.record()
    advance()
  }

  function finish() {
    if (phase.value === 'done') return
    phase.value = 'done'
    // recordSpeedBest only persists when the score beats the prior best; the
    // in-memory blob updates synchronously so bestScore reflects it at once.
    void settings.recordSpeedBest(deckId.value, score.value)
  }

  function tick() {
    if (phase.value !== 'playing') return
    timeLeft.value -= 1
    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      finish()
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
    item,
    bestScore,
    start,
    answer,
    tick,
    finish,
  }
}
