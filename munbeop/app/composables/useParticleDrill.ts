import { computed, ref } from 'vue'
import type { ClashSet, DrillItem, DrillVerdict, LocaleCode } from '~/lib/domain'
import { localized } from '~/lib/domain'
import {
  correctSentence,
  judge,
  scoreOf,
  shuffle,
  type DrillItemResult,
} from '~/lib/particle-lab'
import { PARTICLE_DRILLS } from '~/seed/particle-drills'
import { CLASH_SETS, clashSetById, DEFAULT_CLASH_SET_ID } from '~/seed/clash-sets'
import { useLogStore } from '~/stores/log'
import { useSrsStore } from '~/stores/srs'
import { useActivityStore } from '~/stores/activity'

export type DrillPhase = 'question' | 'blocked' | 'right' | 'wrong' | 'done'
export type DrillMode = 'normal' | 'replay'

/** Synthetic context shown in diary entries written by the lab (D7). */
const LAB_CONTEXT = { id: 'particle-lab', name: '조사 LAB' }
/** Session accuracy required before 'easy' diary entries are written (D6). */
const EASY_THRESHOLD = 0.7
/** Min ended-correct items per family for that family's 'easy' entry (D6). */
const MIN_FAMILY_CORRECT = 3

export function useParticleDrill(initialSetId: string = DEFAULT_CLASH_SET_ID) {
  const logStore = useLogStore()
  const srsStore = useSrsStore()
  const activity = useActivityStore()
  const { t, locale } = useI18n()

  const availableSets = CLASH_SETS
  const selectedSetId = ref(clashSetById(initialSetId) ? initialSetId : DEFAULT_CLASH_SET_ID)
  const set = computed<ClashSet>(() => clashSetById(selectedSetId.value)!)
  const items = computed<DrillItem[]>(() =>
    PARTICLE_DRILLS.filter((it) => it.setId === selectedSetId.value),
  )

  /** The ordered items for the current round (shuffled set, or failed subset). */
  const sessionItems = ref<DrillItem[]>([])
  const mode = ref<DrillMode>('normal')

  const index = ref(0)
  const phase = ref<DrillPhase>('question')
  const verdict = ref<DrillVerdict | null>(null)
  const picked = ref<string | null>(null)
  const blockedChoices = ref<Set<string>>(new Set())
  const results = ref<DrillItemResult[]>([])
  const slipsThisItem = ref(0)
  const gardenGrew = ref(false)

  const item = computed<DrillItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === i.id && !r.correct)),
  )

  /** Switch the active clash set. Caller restarts the round. */
  function selectSet(id: string) {
    if (clashSetById(id)) selectedSetId.value = id
  }

  function resetRound() {
    index.value = 0
    phase.value = 'question'
    verdict.value = null
    picked.value = null
    blockedChoices.value = new Set()
    results.value = []
    slipsThisItem.value = 0
    gardenGrew.value = false
  }

  async function start() {
    mode.value = 'normal'
    sessionItems.value = shuffle(items.value)
    resetRound()
    await Promise.all(set.value.families.map((f) => srsStore.markSeen(f.grammarKo)))
  }

  /** Re-drill only the items missed in the round just finished (practice mode). */
  async function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    mode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    await Promise.all(set.value.families.map((f) => srsStore.markSeen(f.grammarKo)))
  }

  async function answer(choice: string) {
    if (phase.value !== 'question') return
    picked.value = choice
    const v = judge(item.value, choice, set.value)
    verdict.value = v
    if (v.kind === 'correct') {
      results.value.push({
        itemId: item.value.id,
        correct: true,
        batchimSlips: slipsThisItem.value,
      })
      phase.value = 'right'
      void activity.record()
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
    if (v.kind === 'contraction') {
      // Retry like a 받침 slip, but don't count it as one (that metric is 받침-only).
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
    void activity.record()
    if (mode.value === 'normal') await logMistake(item.value, choice)
  }

  /** Leave the 받침 block and let the user pick again. */
  function retry() {
    if (phase.value === 'blocked') phase.value = 'question'
  }

  async function next() {
    if (phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
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
  async function logMistake(it: DrillItem, choice: string) {
    const grammarKo = set.value.families[it.familyIndex].grammarKo
    await logStore.add({
      ko: grammarKo,
      sentence: correctSentence(it, set.value),
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
    if (mode.value === 'replay') return
    if (score.value.accuracy < EASY_THRESHOLD) return
    for (const [idx, family] of set.value.families.entries()) {
      const corrects = sessionItems.value.filter(
        (i) =>
          i.familyIndex === idx &&
          results.value.some((r) => r.itemId === i.id && r.correct),
      )
      if (corrects.length < MIN_FAMILY_CORRECT) continue
      await logStore.add({
        ko: family.grammarKo,
        sentence: correctSentence(corrects[0]!, set.value),
        feedback: 'easy',
        errorNote: null,
        reviewState: 'correct',
        contextId: LAB_CONTEXT.id,
        contextName: LAB_CONTEXT.name,
      })
      await srsStore.recalculate(family.grammarKo)
      gardenGrew.value = true
    }
  }

  return {
    items,
    sessionItems,
    mode,
    set,
    selectedSetId,
    availableSets,
    index,
    phase,
    verdict,
    picked,
    blockedChoices,
    item,
    score,
    failedItems,
    gardenGrew,
    selectSet,
    start,
    replayFailed,
    answer,
    retry,
    next,
  }
}
