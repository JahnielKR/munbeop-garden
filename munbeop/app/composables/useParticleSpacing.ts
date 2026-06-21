import { computed, ref } from 'vue'
import type { LabSentence } from '~/lib/domain'
import {
  buildPuzzle,
  gradePuzzle,
  scoreOf,
  shuffle,
  type DrillItemResult,
  type GapValue,
  type SpacingLevel,
  type SpacingResult,
} from '~/lib/particle-lab'
import { PARTICLE_SENTENCES } from '~/seed/particle-sentences'

export type SpacingPhase = 'question' | 'answered' | 'done'
export type SpacingMode = 'normal' | 'replay'

/**
 * 띄어쓰기 (spacing) drill loop. Self-contained: no SRS/diary writes — spacing is
 * orthography, not particle mastery. Mirrors useParticleDrill's shape.
 */
export function useParticleSpacing() {
  const level = ref<SpacingLevel>(1)
  const sessionItems = ref<LabSentence[]>([])
  const mode = ref<SpacingMode>('normal')

  const index = ref(0)
  const phase = ref<SpacingPhase>('question')
  const answers = ref<GapValue[]>([])
  const result = ref<SpacingResult | null>(null)
  const results = ref<DrillItemResult[]>([])

  const sentence = computed<LabSentence>(() => sessionItems.value[index.value]!)
  const puzzle = computed(() => buildPuzzle(sentence.value, level.value))
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((s) => results.value.some((r) => r.itemId === s.id && !r.correct)),
  )

  /** All gaps default to 'join' — the task is to insert the spaces. */
  function freshAnswers(): GapValue[] {
    return puzzle.value.gaps.map(() => 'join')
  }

  function resetItem() {
    phase.value = 'question'
    result.value = null
    answers.value = freshAnswers()
  }

  function resetRound() {
    index.value = 0
    results.value = []
    resetItem()
  }

  function start() {
    mode.value = 'normal'
    sessionItems.value = shuffle(PARTICLE_SENTENCES)
    resetRound()
  }

  /** Switch level and restart (level is otherwise sticky across rounds). */
  function selectLevel(l: SpacingLevel) {
    level.value = l
    start()
  }

  /** Re-drill only the missed sentences from the round just finished. */
  function replayFailed() {
    const failed = failedItems.value
    if (failed.length === 0) return
    mode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
  }

  function toggleGap(i: number) {
    if (phase.value !== 'question') return
    const next = [...answers.value]
    next[i] = next[i] === 'space' ? 'join' : 'space'
    answers.value = next
  }

  function check() {
    if (phase.value !== 'question') return
    const r = gradePuzzle(puzzle.value, answers.value)
    result.value = r
    results.value.push({ itemId: sentence.value.id, correct: r.correct, batchimSlips: 0 })
    phase.value = 'answered'
  }

  function next() {
    if (phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      return
    }
    index.value += 1
    resetItem()
  }

  return {
    level,
    sessionItems,
    mode,
    index,
    phase,
    answers,
    result,
    sentence,
    puzzle,
    score,
    failedItems,
    start,
    selectLevel,
    replayFailed,
    toggleGap,
    check,
    next,
  }
}
