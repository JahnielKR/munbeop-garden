import { computed, ref } from 'vue'
import { shuffle } from '~/lib/particle-lab/shuffle'
import { buildRound, scoreOf, itemId, type DrillResult } from '~/lib/numbers-market'
import { NUMBER_DOMAINS } from '~/lib/numbers-market/sets'
import type { MarketItem, NumberDomain } from '~/lib/domain'
import { useNumberMarketAudio } from '~/composables/useNumberMarketAudio'
import { useActivityStore } from '~/stores/activity'
import { useNumberMarketMaster } from '~/composables/useNumberMarketMaster'
import { useStudySession } from '~/composables/useStudySession'

export type DictationPhase = 'input' | 'right' | 'wrong' | 'done'
export type DictationRunMode = 'normal' | 'replay'
const ROUND_SIZE = 8

/**
 * Compare-normalize a typed value: strip whitespace and hyphens (valueKeys have
 * none). Time answers are "h:mm" — the minute is zero-padded, the hour is not
 * (e.g. "3:05") — so accept "3:5" / "03:05" by padding the minute and dropping a
 * leading-zero hour. Only the time domain uses a colon, so non-time inputs are
 * untouched.
 */
export function normalizeValue(s: string): string {
  const t = s.replace(/[\s-]+/g, '')
  const time = /^(\d{1,2}):(\d{1,2})$/.exec(t)
  if (time) return `${Number(time[1])}:${time[2]!.padStart(2, '0')}`
  return t
}

export function useNumberDictation(master = useNumberMarketMaster()) {
  const audio = useNumberMarketAudio()
  const activity = useActivityStore()
  const studySession = useStudySession()

  const selectedDomain = ref<NumberDomain>(NUMBER_DOMAINS[0]!.id)
  const sessionItems = ref<MarketItem[]>([])
  const runMode = ref<DictationRunMode>('normal')
  const index = ref(0)
  const phase = ref<DictationPhase>('input')
  const entry = ref('')
  const results = ref<DrillResult[]>([])

  const item = computed<MarketItem>(() => sessionItems.value[index.value]!)
  const score = computed(() => scoreOf(results.value))
  const failedItems = computed(() =>
    sessionItems.value.filter((i) =>
      results.value.some((r) => r.itemId === itemId(i) && !r.correct),
    ),
  )

  function play() {
    if (item.value) audio.playReading(item.value.answer)
  }
  function resetRound() {
    index.value = 0
    phase.value = 'input'
    entry.value = ''
    results.value = []
  }

  function selectDomain(id: NumberDomain) {
    selectedDomain.value = id
  }

  function start() {
    if (!master.resetSaveStatus()) return false
    studySession.begin()
    runMode.value = 'normal'
    sessionItems.value = buildRound(selectedDomain.value, ROUND_SIZE, shuffle)
    resetRound()
    if (sessionItems.value.length) play()
    return true
  }

  function replayFailed() {
    if (!studySession.isCurrent()) return false
    if (!master.resetSaveStatus()) return false
    const failed = failedItems.value
    if (failed.length === 0) return false
    runMode.value = 'replay'
    sessionItems.value = shuffle(failed)
    resetRound()
    play()
    return true
  }

  function submit() {
    if (phase.value !== 'input' || !studySession.isCurrent()) return
    const correct = normalizeValue(entry.value) === item.value.valueKey
    results.value.push({ itemId: itemId(item.value), correct })
    phase.value = correct ? 'right' : 'wrong'
    // Fire-and-forget heatmap tick; record() swallows transient cloud errors.
    void activity.record('dictation')
  }

  async function next() {
    if (phase.value === 'input' || phase.value === 'done') return
    if (index.value + 1 >= sessionItems.value.length) {
      phase.value = 'done'
      if (runMode.value === 'normal') {
        await master.recordRound(selectedDomain.value, score.value.accuracy)
      }
      return
    }
    index.value += 1
    phase.value = 'input'
    entry.value = ''
    play()
  }

  return {
    master,
    selectedDomain,
    sessionItems,
    runMode,
    index,
    phase,
    entry,
    item,
    score,
    failedItems,
    selectDomain,
    start,
    replayFailed,
    play,
    submit,
    next,
  }
}
