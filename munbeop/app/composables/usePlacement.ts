// app/composables/usePlacement.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import {
  createLadder, recordAnswer, ladderOutcome,
  itemsForLevel, selectItems, optionsFor, Q_PER_LEVEL,
  type LadderState, type PlacementOutcome,
} from '~/lib/placement'
import type { PlacementItem, TopikLevel } from '~/lib/domain'
import { useSettingsStore } from '~/stores/settings'
import { useActivityStore } from '~/stores/activity'

export type PlacementPhase = 'question' | 'right' | 'wrong' | 'done'

export function usePlacement() {
  const settings = useSettingsStore()
  const activity = useActivityStore()

  const ladder = ref<LadderState>(createLadder())
  const levelItems = ref<PlacementItem[]>([])
  const indexInLevel = ref(0)
  const displayOptions = ref<string[]>([])
  const phase = ref<PlacementPhase>('question')
  const picked = ref<string | null>(null)
  const outcome = ref<PlacementOutcome | null>(null)
  const saving = ref(false)
  const saveError = ref(false)

  const item = computed<PlacementItem>(() => levelItems.value[indexInLevel.value]!)

  function loadLevel(level: TopikLevel) {
    levelItems.value = selectItems(itemsForLevel(level), Q_PER_LEVEL, shuffle)
    indexInLevel.value = 0
    phase.value = 'question'
    picked.value = null
    if (levelItems.value.length) displayOptions.value = shuffle(optionsFor(item.value))
  }

  function start(): boolean {
    // Do not let a retake replace the outcome while its recommendation write is
    // still in flight; the late response would otherwise mutate the new run.
    if (saving.value || saveError.value) return false
    ladder.value = createLadder()
    outcome.value = null
    saving.value = false
    saveError.value = false
    loadLevel(ladder.value.currentLevel)
    return true
  }

  async function saveRecommendation(): Promise<void> {
    if (!outcome.value || saving.value) return
    saving.value = true
    saveError.value = false
    try {
      const saved = await settings.setStartingDeck(outcome.value.startingDeckId)
      saveError.value = !saved
    } catch {
      // Keep the result visible and offer an explicit retry. Settings normally
      // returns false, but this catch protects custom/test adapters that throw.
      saveError.value = true
    } finally {
      saving.value = false
    }
  }

  function answer(choice: string) {
    if (phase.value !== 'question') return
    picked.value = choice
    phase.value = choice === item.value.answer ? 'right' : 'wrong'
  }

  async function next() {
    if (phase.value === 'question' || phase.value === 'done') return
    const correct = phase.value === 'right'
    const prevLevel = ladder.value.currentLevel
    ladder.value = recordAnswer(ladder.value, correct)
    void activity.record()

    if (ladder.value.done) {
      outcome.value = ladderOutcome(ladder.value)
      phase.value = 'done'
      await saveRecommendation()
      return
    }
    if (ladder.value.currentLevel !== prevLevel) {
      loadLevel(ladder.value.currentLevel)
    } else {
      indexInLevel.value += 1
      phase.value = 'question'
      picked.value = null
      displayOptions.value = shuffle(optionsFor(item.value))
    }
  }

  return {
    ladder,
    item,
    displayOptions,
    phase,
    picked,
    outcome,
    saving,
    saveError,
    start,
    answer,
    next,
    retrySave: saveRecommendation,
  }
}
