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
import { useAuthStore } from '~/stores/auth'
import type { PracticeSaveStatus } from '~/lib/practice/persistence'

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
  const auth = useAuthStore()
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
  const saveStatus = ref<PracticeSaveStatus>('idle')
  const pendingMistake = ref<{ id: number; item: DrillItem; choice: string } | null>(null)
  const pendingCredits = ref<Array<{ id: number; grammarKo: string; item: DrillItem }>>([])
  const completionPrepared = ref(false)
  let runOwnerUserId: string | null = null
  let runGeneration = 0

  function runStillOwned(ownerUserId = runOwnerUserId, generation = runGeneration): boolean {
    return (auth.user?.id ?? null) === ownerUserId && runGeneration === generation
  }

  const item = computed<DrillItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) => results.value.some((r) => r.itemId === i.id && !r.correct)),
  )
  const saveBlocked = computed(() => saveStatus.value === 'saving' || saveStatus.value === 'error')

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
    saveStatus.value = 'idle'
    pendingMistake.value = null
    pendingCredits.value = []
    completionPrepared.value = false
  }

  async function start() {
    if (saveBlocked.value) return
    runGeneration += 1
    runOwnerUserId = auth.user?.id ?? null
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    mode.value = 'normal'
    sessionItems.value = shuffle(items.value)
    resetRound()
    const markSeenResults = await Promise.allSettled(
      set.value.families.map((family) => srsStore.markSeen(family.grammarKo)),
    )
    if (!runStillOwned(ownerUserId, generation)) return
    if (markSeenResults.some((result) => result.status === 'rejected')) {
      console.error('particle lab: one or more mark-seen writes failed')
    }
  }

  /** Re-drill only the items missed in the round just finished (practice mode). */
  async function replayFailed() {
    if (saveBlocked.value) return
    const failed = failedItems.value
    if (failed.length === 0) return
    runGeneration += 1
    runOwnerUserId = auth.user?.id ?? null
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    mode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    const markSeenResults = await Promise.allSettled(
      set.value.families.map((family) => srsStore.markSeen(family.grammarKo)),
    )
    if (!runStillOwned(ownerUserId, generation)) return
    if (markSeenResults.some((result) => result.status === 'rejected')) {
      console.error('particle lab: one or more mark-seen writes failed')
    }
  }

  async function answer(choice: string) {
    if (phase.value !== 'question' || saveStatus.value === 'saving' || !runStillOwned()) return
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
      if (runStillOwned()) void activity.record()
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
    if (runStillOwned()) void activity.record()
    if (mode.value === 'normal') {
      pendingMistake.value = { id: logStore.createEntryId(), item: item.value, choice }
      await persistPendingMistake()
    }
  }

  /** Leave the 받침 block and let the user pick again. */
  function retry() {
    if (phase.value === 'blocked') phase.value = 'question'
  }

  async function next() {
    // Only a resolved answer may advance. Repeated click/keyboard emits that
    // arrive after reset must not skip the newly displayed question.
    if (
      (phase.value !== 'right' && phase.value !== 'wrong')
      || saveStatus.value === 'saving'
      || saveStatus.value === 'error'
    ) return
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
    saveStatus.value = 'idle'
    pendingMistake.value = null
  }

  /** Semantic error → one hard/incorrect diary entry with retry-safe state. */
  async function persistPendingMistake(): Promise<boolean> {
    const pending = pendingMistake.value
    if (!pending || saveStatus.value === 'saving') return false
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    if (!runStillOwned(ownerUserId, generation)) return false
    const grammarKo = set.value.families[pending.item.familyIndex].grammarKo
    saveStatus.value = 'saving'
    try {
      await logStore.add({
        ko: grammarKo,
        sentence: correctSentence(pending.item, set.value),
        feedback: 'hard',
        errorNote: `${t('particles.drill.diary_note', { choice: pending.choice })} ${localized(pending.item.reason, locale.value as LocaleCode)}`,
        errorDimension: 'particle',
        reviewState: 'incorrect',
        contextId: LAB_CONTEXT.id,
        contextName: LAB_CONTEXT.name,
      }, pending.id)
      if (!runStillOwned(ownerUserId, generation)) return false
    } catch (error) {
      console.error('particle lab: diary write failed', error)
      saveStatus.value = 'error'
      return false
    }
    pendingMistake.value = null
    try {
      await srsStore.recalculate(grammarKo)
      if (!runStillOwned(ownerUserId, generation)) return false
    } catch (error) {
      console.error('particle lab: SRS recalculation failed', error)
    }
    saveStatus.value = 'saved'
    return true
  }

  /** Session end: accuracy gate, then one easy/correct entry per family (D6b). */
  async function finish() {
    if (saveStatus.value === 'saving') return
    if (mode.value === 'replay') return
    if (score.value.accuracy < EASY_THRESHOLD) return
    const ownerUserId = runOwnerUserId
    const generation = runGeneration
    if (!runStillOwned(ownerUserId, generation)) return
    if (!completionPrepared.value) {
      for (const [idx, family] of set.value.families.entries()) {
        const corrects = sessionItems.value.filter(
          (i) =>
            i.familyIndex === idx &&
            results.value.some((r) => r.itemId === i.id && r.correct),
        )
        if (corrects.length >= MIN_FAMILY_CORRECT) {
          pendingCredits.value.push({
            id: logStore.createEntryId(),
            grammarKo: family.grammarKo,
            item: corrects[0]!,
          })
        }
      }
      completionPrepared.value = true
    }
    if (pendingCredits.value.length === 0) return
    saveStatus.value = 'saving'
    while (pendingCredits.value.length > 0) {
      if (!runStillOwned(ownerUserId, generation)) return
      const credit = pendingCredits.value[0]!
      try {
        await logStore.add({
          ko: credit.grammarKo,
          sentence: correctSentence(credit.item, set.value),
          feedback: 'easy',
          errorNote: null,
          reviewState: 'correct',
          contextId: LAB_CONTEXT.id,
          contextName: LAB_CONTEXT.name,
        }, credit.id)
        if (!runStillOwned(ownerUserId, generation)) return
      } catch (error) {
        console.error('particle lab: round credit write failed', error)
        saveStatus.value = 'error'
        return
      }
      pendingCredits.value.shift()
      try {
        await srsStore.recalculate(credit.grammarKo)
        if (!runStillOwned(ownerUserId, generation)) return
      } catch (error) {
        console.error('particle lab: SRS recalculation failed', error)
      }
      gardenGrew.value = true
    }
    saveStatus.value = 'saved'
  }

  async function retrySave() {
    if (saveStatus.value !== 'error') return
    if (pendingMistake.value) await persistPendingMistake()
    else await finish()
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
    saveStatus,
    saveBlocked,
    selectSet,
    start,
    replayFailed,
    answer,
    retry,
    next,
    retrySave,
  }
}
