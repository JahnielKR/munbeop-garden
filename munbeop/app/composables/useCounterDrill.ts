import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, optionsFor, scoreOf, itemId, type DrillResult } from '~/lib/counters'
import { COUNTER_SETS } from '~/lib/counters/sets'
import { COUNTERS } from '~/seed/counters'
import type { CountItem } from '~/lib/domain'
import { useCounterMaster } from '~/composables/useCounterMaster'
import { useActivityStore } from '~/stores/activity'

export type CounterPhase = 'question' | 'right' | 'wrong' | 'done'
export type CounterRunMode = 'normal' | 'replay'
const ROUND_SIZE = 8

export function useCounterDrill() {
  const master = useCounterMaster()
  const activity = useActivityStore()

  const selectedSetId = ref<string>(COUNTER_SETS[0]!.id)
  const sessionItems = ref<CountItem[]>([])
  const displayOptions = ref<string[]>([])
  const runMode = ref<CounterRunMode>('normal')
  const index = ref(0)
  const phase = ref<CounterPhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])

  const item = computed<CountItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )
  const counterIdsOf = (setId: string) => COUNTER_SETS.find((s) => s.id === setId)?.counterIds ?? []

  function shuffleOptions() {
    displayOptions.value = shuffle(optionsFor(item.value, COUNTERS))
  }
  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
  }

  function selectSet(id: string) {
    selectedSetId.value = id
  }

  function start() {
    runMode.value = 'normal'
    sessionItems.value = buildRound(counterIdsOf(selectedSetId.value), ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) shuffleOptions()
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    shuffleOptions()
  }

  async function answer(choice: string) {
    if (phase.value !== 'question') return
    picked.value = choice
    const correct = choice === item.value.answer
    results.value.push({ itemId: itemId(item.value), correct })
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
  }

  async function next() {
    if (phase.value === 'question' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      if (runMode.value === 'normal') master.recordRound(selectedSetId.value, score.value.accuracy)
      return
    }
    index.value += 1
    phase.value = 'question'
    picked.value = null
    shuffleOptions()
  }

  return {
    selectedSetId, sessionItems, displayOptions, runMode, index, phase, picked,
    item, score, failedItems,
    selectSet, start, replayFailed, answer, next,
  }
}
