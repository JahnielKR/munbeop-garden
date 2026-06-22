// app/composables/useClozeDrill.ts
import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, optionsFor, scoreOf, itemId, type DrillResult } from '~/lib/cloze'
import type { ClozeItem } from '~/lib/domain'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

export type ClozePhase = 'question' | 'right' | 'wrong' | 'done'
export type ClozeRunMode = 'normal' | 'replay'

const LAB_CONTEXT = { id: 'cloze-lab', name: '빈칸 LAB' }
const ROUND_SIZE = 8
const CREDIT_THRESHOLD = 0.7

export function useClozeDrill() {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const { t } = useI18n()

  const sessionItems = ref<ClozeItem[]>([])
  const displayOptions = ref<string[]>([])
  const runMode = ref<ClozeRunMode>('normal')
  const index = ref(0)
  const phase = ref<ClozePhase>('question')
  const picked = ref<string | null>(null)
  const results = ref<DrillResult[]>([])

  const item = computed<ClozeItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === itemId(i) && !r.correct)),
  )

  function shuffleOptions() {
    displayOptions.value = shuffle(optionsFor(item.value))
  }
  function resetRound() {
    index.value = 0
    phase.value = 'question'
    picked.value = null
    results.value = []
  }

  async function start(kos: string[]) {
    runMode.value = 'normal'
    sessionItems.value = buildRound(kos, ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) shuffleOptions()
    for (const ko of new Set(sessionItems.value.map((i) => i.ko))) await srsStore.markSeen(ko)
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
    results.value.push({ itemId: itemId(item.value), ko: item.value.ko, correct })
    phase.value = correct ? 'right' : 'wrong'
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

  /** Credit easy/correct per ko cleared at round end (normal mode only), then recalculate. */
  async function finish() {
    if (runMode.value !== 'normal') return
    const byKo = new Map<string, { correct: number; total: number; firstCorrect: ClozeItem | null }>()
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
    for (const [ko, g] of byKo) {
      if (g.firstCorrect && g.total > 0 && g.correct / g.total >= CREDIT_THRESHOLD) {
        await logStore.add({
          ko,
          sentence: g.firstCorrect.sentence.replace('{}', g.firstCorrect.answer),
          feedback: 'easy',
          errorNote: null,
          reviewState: 'correct',
          contextId: LAB_CONTEXT.id,
          contextName: LAB_CONTEXT.name,
        })
      }
      await srsStore.recalculate(ko)
    }
  }

  async function logMistake(it: ClozeItem, choice: string) {
    await logStore.add({
      ko: it.ko,
      sentence: it.sentence.replace('{}', it.answer),
      feedback: 'hard',
      errorNote: t('cloze.diary_note', { chosen: choice, correct: it.answer }),
      errorDimension: it.errorDimension ?? 'other',
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
    await srsStore.recalculate(it.ko)
  }

  return {
    sessionItems, displayOptions, runMode, index, phase, picked,
    item, score, failedItems,
    start, replayFailed, answer, next, finish,
  }
}
