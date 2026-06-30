// app/composables/useSentenceGarden.ts
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

export type SGPhase = 'placing' | 'right' | 'wrong' | 'done'
export type SGRunMode = 'normal' | 'replay'
export interface SGCard { id: number; text: string }

const LAB_CONTEXT = { id: 'sentence-garden-lab', name: '문장 정원 LAB' }
const ROUND_SIZE = 8
const CREDIT_THRESHOLD = 0.7
const POOL = SENTENCE_GARDEN_POOL

interface SGResult { index: number; sentence: string; ko: string; correct: boolean }

export function useSentenceGarden() {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const activity = useActivityStore()
  const { playExample } = useExampleAudio()

  const sessionItems = ref<SentenceGardenRound[]>([])
  const runMode = ref<SGRunMode>('normal')
  const index = ref(0)
  const phase = ref<SGPhase>('placing')
  const tray = ref<SGCard[]>([])
  const placed = ref<SGCard[]>([])
  const results = ref<SGResult[]>([])

  const item = computed<SentenceGardenRound>(() => sessionItems.value[index.value]!)
  const score = computed(() => ({
    correct: results.value.filter((r) => r.correct).length,
    total: results.value.length,
  }))
  const failedItems = computed(() => {
    const failed = new Set(results.value.filter((r) => !r.correct).map((r) => r.index))
    return sessionItems.value.filter((_round, i) => failed.has(i))
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

  async function start(kos: string[]) {
    runMode.value = 'normal'
    sessionItems.value = selectRounds(POOL, kos, ROUND_SIZE)
    if (sessionItems.value.length) resetRound()
    for (const ko of new Set(sessionItems.value.map((i) => i.ko))) {
      await srsStore.markSeen(ko)
    }
  }

  function place(card: SGCard) {
    if (phase.value !== 'placing') return
    const at = tray.value.findIndex((c) => c.id === card.id)
    if (at === -1) return
    tray.value.splice(at, 1)
    placed.value.push(card)
  }

  function removeAt(i: number) {
    if (phase.value !== 'placing') return
    const [card] = placed.value.splice(i, 1)
    if (card) tray.value.push(card)
  }

  function check() {
    if (phase.value !== 'placing' || !canCheck.value) return
    const correct = checkOrder(
      placed.value.map((c) => c.text),
      item.value.answer,
    )
    results.value.push({ index: index.value, sentence: item.value.sentence, ko: item.value.ko, correct })
    phase.value = correct ? 'right' : 'wrong'
    void activity.record()
    if (correct) {
      playExample(item.value.sentence)
    } else if (runMode.value === 'normal') {
      void logMistake(item.value).catch((err) => console.error('sentence-garden: failed to log miss', err))
    }
  }

  async function next() {
    if (phase.value === 'placing' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    loadRound()
  }

  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
  }

  /** Credit easy/correct per ko cleared at round end (normal mode only), then recalculate. */
  async function finish() {
    if (runMode.value !== 'normal') return
    const byKo = new Map<
      string,
      { correct: number; total: number; first: SentenceGardenRound | null }
    >()
    for (let i = 0; i < sessionItems.value.length; i++) {
      const it = sessionItems.value[i]!
      const r = results.value.find((x) => x.index === i)
      if (!r) continue
      const g = byKo.get(it.ko) ?? { correct: 0, total: 0, first: null }
      g.total += 1
      if (r.correct) {
        g.correct += 1
        if (!g.first) g.first = it
      }
      byKo.set(it.ko, g)
    }
    for (const [ko, g] of byKo) {
      if (g.first && g.total > 0 && g.correct / g.total >= CREDIT_THRESHOLD) {
        await logStore.add({
          ko,
          sentence: g.first.sentence,
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

  async function logMistake(round: SentenceGardenRound) {
    await logStore.add({
      ko: round.ko,
      sentence: round.sentence,
      feedback: 'hard',
      errorNote: null,
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
    await srsStore.recalculate(round.ko)
  }

  return {
    sessionItems,
    runMode,
    index,
    phase,
    tray,
    placed,
    results,
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
  }
}
