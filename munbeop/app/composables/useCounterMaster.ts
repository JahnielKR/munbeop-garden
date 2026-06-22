import { computed, ref } from 'vue'
import { masteryOf } from '~/lib/counters/sets'

const STORAGE_KEY = 'counter-lab.cleared'
const EARNED_KEY = 'counter-lab.masterEarned'
const CLEAR_THRESHOLD = 0.7

function readSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function useCounterMaster() {
  const cleared = ref<Set<string>>(readSet(STORAGE_KEY))
  const earnedSticky = ref(typeof localStorage !== 'undefined' && !!localStorage.getItem(EARNED_KEY))
  const celebrate = ref(false)

  const view = computed(() => masteryOf(cleared.value))
  const perSet = computed(() => view.value.perSet)
  const doneCount = computed(() => view.value.doneCount)
  const total = computed(() => view.value.total)
  const earned = computed(() => view.value.earned || earnedSticky.value)

  function recordRound(setId: string, accuracy: number) {
    if (accuracy < CLEAR_THRESHOLD) return
    if (cleared.value.has(setId)) return
    const next = new Set(cleared.value)
    next.add(setId)
    cleared.value = next
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
    if (view.value.earned && typeof localStorage !== 'undefined' && !localStorage.getItem(EARNED_KEY)) {
      localStorage.setItem(EARNED_KEY, '1')
      earnedSticky.value = true
      celebrate.value = true
    }
  }

  function dismiss() {
    celebrate.value = false
  }

  return { perSet, doneCount, total, earned, celebrate, recordRound, dismiss }
}
