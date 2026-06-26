// app/composables/useRegisterDrill.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import {
  buildRound,
  optionsFor,
  scoreOf,
  itemId,
  isValidSet,
  type DrillResult,
} from '~/lib/register-transform'
import type { RegisterItem, RegisterMode } from '~/lib/domain'
import { useLogStore } from '~/stores/log'
import { useActivityStore } from '~/stores/activity'

export type RegisterPhase = 'question' | 'right' | 'wrong' | 'done'
export type RegisterRunMode = 'normal' | 'replay'

const LAB_CONTEXT = { id: 'register-lab', name: '높임법 LAB' }
const ROUND_SIZE = 8

export function useRegisterDrill(initialMode: RegisterMode = 'level', initialSet = 'mixed') {
  const logStore = useLogStore()
  const activity = useActivityStore()
  const { t } = useI18n()

  const mode = ref<RegisterMode>(initialMode)
  const selectedSet = ref<string>(isValidSet(initialMode, initialSet) ? initialSet : 'mixed')
  const sessionItems = ref<RegisterItem[]>([])
  const displayOptions = ref<string[]>([])
  const runMode = ref<RegisterRunMode>('normal')
  const index = ref(0)
  const phase = ref<RegisterPhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])

  const item = computed<RegisterItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )

  function shuffleOptions() {
    displayOptions.value = shuffle(optionsFor(item.value))
  }
  function selectMode(m: RegisterMode) {
    mode.value = m
    selectedSet.value = 'mixed'
  }
  function selectSet(s: string) {
    if (isValidSet(mode.value, s)) selectedSet.value = s
  }
  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
  }
  function start() {
    runMode.value = 'normal'
    sessionItems.value = buildRound(mode.value, selectedSet.value, ROUND_SIZE, shuffle)
    resetRound()
    shuffleOptions()
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
    if (!correct && runMode.value === 'normal') await logMistake(item.value, choice)
  }
  async function next() {
    if (phase.value === 'question' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    phase.value = 'question'
    picked.value = null
    shuffleOptions()
  }
  async function logMistake(it: RegisterItem, choice: string) {
    await logStore.add({
      ko: it.source,
      sentence: `${it.source} → ${it.answer}`,
      feedback: 'hard',
      errorNote: t('register.diary_note', { chosen: choice, correct: it.answer }),
      errorDimension: 'register',
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
  }

  return {
    mode,
    selectedSet,
    sessionItems,
    displayOptions,
    runMode,
    index,
    phase,
    picked,
    item,
    score,
    failedItems,
    selectMode,
    selectSet,
    start,
    replayFailed,
    answer,
    next,
  }
}
