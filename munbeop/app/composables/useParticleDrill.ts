import { computed, ref } from 'vue'
import type { DrillChoice, DrillItem, DrillVerdict, LocaleCode } from '~/lib/domain'
import { localized } from '~/lib/domain'
import {
  correctSentence,
  judge,
  scoreOf,
  type DrillItemResult,
} from '~/lib/particle-lab'
import { PARTICLE_DRILLS } from '~/seed/particle-drills'
import { particleById } from '~/seed/particles'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'

export type DrillPhase = 'question' | 'blocked' | 'right' | 'wrong' | 'done'

/** Synthetic context shown in diary entries written by the lab (D7). */
const LAB_CONTEXT = { id: 'particle-lab', name: '조사 LAB' }
/** Session accuracy required before 'easy' diary entries are written (D6). */
const EASY_THRESHOLD = 0.7
/** Min ended-correct items per family for that family's 'easy' entry (D6). */
const MIN_FAMILY_CORRECT = 3

export function useParticleDrill() {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const { t, locale } = useI18n()

  const items = PARTICLE_DRILLS
  const index = ref(0)
  const phase = ref<DrillPhase>('question')
  const verdict = ref<DrillVerdict | null>(null)
  const picked = ref<DrillChoice | null>(null)
  const blockedChoices = ref<Set<DrillChoice>>(new Set())
  const results = ref<DrillItemResult[]>([])
  const slipsThisItem = ref(0)
  const gardenGrew = ref(false)

  const item = computed<DrillItem>(() => items[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    items.filter((i) => results.value.some((r) => r.itemId === i.id && !r.correct)),
  )

  async function start() {
    index.value = 0
    phase.value = 'question'
    verdict.value = null
    picked.value = null
    blockedChoices.value = new Set()
    results.value = []
    slipsThisItem.value = 0
    gardenGrew.value = false
    await Promise.all(
      (['topic', 'subject'] as const).map((id) =>
        srsStore.markSeen(particleById(id)!.grammarKo),
      ),
    )
  }

  async function answer(choice: DrillChoice) {
    if (phase.value !== 'question') return
    picked.value = choice
    const v = judge(item.value, choice)
    verdict.value = v
    if (v.kind === 'correct') {
      results.value.push({
        itemId: item.value.id,
        correct: true,
        batchimSlips: slipsThisItem.value,
      })
      phase.value = 'right'
      return
    }
    if (v.kind === 'blocked') {
      slipsThisItem.value += 1
      const next = new Set(blockedChoices.value)
      next.add(choice)
      blockedChoices.value = next
      phase.value = 'blocked'
      return
    }
    results.value.push({
      itemId: item.value.id,
      correct: false,
      batchimSlips: slipsThisItem.value,
    })
    phase.value = 'wrong'
    await logMistake(item.value, choice)
  }

  /** Leave the 받침 block and let the user pick again. */
  function retry() {
    if (phase.value === 'blocked') phase.value = 'question'
  }

  async function next() {
    if (phase.value === 'done') return
    if (index.value + 1 >= items.length) {
      phase.value = 'done'
      await finish()
      return
    }
    index.value += 1
    phase.value = 'question'
    verdict.value = null
    picked.value = null
    blockedChoices.value = new Set()
    slipsThisItem.value = 0
  }

  /** Semantic error → one hard/incorrect diary entry with auto note (D6a). */
  async function logMistake(it: DrillItem, choice: DrillChoice) {
    const grammarKo = particleById(it.family)!.grammarKo
    await logStore.add({
      ko: grammarKo,
      sentence: correctSentence(it),
      feedback: 'hard',
      errorNote: `${t('particles.drill.diary_note', { choice })} ${localized(it.reason, locale.value as LocaleCode)}`,
      errorDimension: 'particle',
      reviewState: 'incorrect',
      contextId: LAB_CONTEXT.id,
      contextName: LAB_CONTEXT.name,
    })
    await srsStore.recalculate(grammarKo)
  }

  /** Session end: accuracy gate, then one easy/correct entry per family (D6b). */
  async function finish() {
    if (score.value.accuracy < EASY_THRESHOLD) return
    for (const family of ['topic', 'subject'] as const) {
      const corrects = items.filter(
        (i) =>
          i.family === family &&
          results.value.some((r) => r.itemId === i.id && r.correct),
      )
      if (corrects.length < MIN_FAMILY_CORRECT) continue
      const grammarKo = particleById(family)!.grammarKo
      await logStore.add({
        ko: grammarKo,
        sentence: correctSentence(corrects[0]!),
        feedback: 'easy',
        errorNote: null,
        reviewState: 'correct',
        contextId: LAB_CONTEXT.id,
        contextName: LAB_CONTEXT.name,
      })
      await srsStore.recalculate(grammarKo)
      gardenGrew.value = true
    }
  }

  return {
    items,
    index,
    phase,
    verdict,
    picked,
    blockedChoices,
    item,
    score,
    failedItems,
    gardenGrew,
    start,
    answer,
    retry,
    next,
  }
}
