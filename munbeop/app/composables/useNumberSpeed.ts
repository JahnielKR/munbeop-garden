import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { choicesFor, generateItems } from '~/lib/numbers-market'
import type { MarketItem, NumberDomain } from '~/lib/domain'
import { useActivityStore } from '~/stores/activity'

export type SpeedPhase = 'playing' | 'done'
/** A deck id: a NumberDomain, or 'mixed' for the all-domains blitz. */
export type SpeedDeckId = string

const DURATION = 60
/** Items generated per refill — large enough that a 60s run rarely repeats. */
const BATCH = 60
const BEST_KEY = 'number-market.speed.best'

function readBest(): Record<string, number> {
  if (typeof localStorage === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}') as Record<string, number>
  } catch {
    return {}
  }
}

export function useNumberSpeed() {
  const activity = useActivityStore()

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
  const best = ref<Record<string, number>>(readBest())

  const item = computed<MarketItem>(() => queue.value[cursor.value]!)
  const bestScore = computed(() => best.value[deckId.value] ?? 0)

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
    if (score.value > (best.value[deckId.value] ?? 0)) {
      best.value = { ...best.value, [deckId.value]: score.value }
      if (typeof localStorage !== 'undefined') localStorage.setItem(BEST_KEY, JSON.stringify(best.value))
    }
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
