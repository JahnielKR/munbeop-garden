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

  const item = computed<PlacementItem>(() => levelItems.value[indexInLevel.value]!)

  function loadLevel(level: TopikLevel) {
    levelItems.value = selectItems(itemsForLevel(level), Q_PER_LEVEL, shuffle)
    indexInLevel.value = 0
    phase.value = 'question'
    picked.value = null
    if (levelItems.value.length) displayOptions.value = shuffle(optionsFor(item.value))
  }

  function start() {
    ladder.value = createLadder()
    outcome.value = null
    loadLevel(ladder.value.currentLevel)
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
      await settings.setStartingDeck(outcome.value.startingDeckId)
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

  return { ladder, item, displayOptions, phase, picked, outcome, start, answer, next }
}
