// app/composables/useConjugationDrill.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import {
  buildRound,
  classById,
  scoreOf,
  type ConjItem,
  type DrillClassId,
  type DrillResult,
} from '~/lib/conjugation-drill'
import { useLogStore } from '~/stores/log'
import { useActivityStore } from '~/stores/activity'
import type { PracticeSaveStatus } from '~/lib/practice/persistence'

export type ConjPhase = 'question' | 'right' | 'wrong' | 'done'
export type ConjMode = 'normal' | 'replay'

const LAB_CONTEXT = { id: 'conjugation-lab', name: '활용 LAB' }
const ROUND_SIZE = 8

export function useConjugationDrill(initialClassId: DrillClassId = 'mixed') {
  const logStore = useLogStore()
  const activity = useActivityStore()
  const { t } = useI18n()

  const selectedClassId = ref<DrillClassId>(classById(initialClassId) ? initialClassId : 'mixed')
  const sessionItems = ref<ConjItem[]>([])
  const displayOptions = ref<string[]>([])
  const mode = ref<ConjMode>('normal')
  const index = ref(0)
  const phase = ref<ConjPhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])
  const saveStatus = ref<PracticeSaveStatus>('idle')
  const pendingMistake = ref<{ id: number; item: ConjItem; choice: string } | null>(null)

  const item = computed<ConjItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === i.id && !r.correct)),
  )

  function shuffleOptions() {
    displayOptions.value = shuffle(item.value.options)
  }

  function selectClass(id: DrillClassId) {
    if (classById(id)) selectedClassId.value = id
  }

  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
    saveStatus.value = 'idle'
    pendingMistake.value = null
  }

  function start() {
    mode.value = 'normal'
    sessionItems.value = buildRound(selectedClassId.value, ROUND_SIZE, shuffle)
    resetRound()
    shuffleOptions()
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    mode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    shuffleOptions()
  }

  async function answer(choice: string) {
    if (phase.value !== 'question' || saveStatus.value === 'saving') return
    picked.value = choice
    const correct = choice === item.value.correct
    results.value.push({ itemId: item.value.id, correct })
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
    if (!correct && mode.value === 'normal') {
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
    ) return
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

  async function persistPendingMistake(): Promise<boolean> {
    const pending = pendingMistake.value
    if (!pending || saveStatus.value === 'saving') return false
    saveStatus.value = 'saving'
    try {
      await logStore.add({
        ko: pending.item.dict,
        sentence: `${pending.item.dict} + ${pending.item.ending} → ${pending.item.correct}`,
        feedback: 'hard',
        errorNote: t('conjugation.diary_note', {
          chosen: pending.choice,
          correct: pending.item.correct,
        }),
        errorDimension: 'ending',
        reviewState: 'incorrect',
        contextId: LAB_CONTEXT.id,
        contextName: LAB_CONTEXT.name,
      }, pending.id)
    } catch (error) {
      console.error('conjugation: diary write failed', error)
      saveStatus.value = 'error'
      return false
    }
    pendingMistake.value = null
    saveStatus.value = 'saved'
    return true
  }

  async function retrySave(): Promise<boolean> {
    if (saveStatus.value !== 'error') return false
    return persistPendingMistake()
  }

  return {
    selectedClassId,
    sessionItems,
    displayOptions,
    mode,
    index,
    phase,
    picked,
    item,
    score,
    failedItems,
    saveStatus,
    selectClass,
    start,
    replayFailed,
    answer,
    next,
    retrySave,
  }
}
