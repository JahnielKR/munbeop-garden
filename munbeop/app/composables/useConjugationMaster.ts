// app/composables/useConjugationMaster.ts
import { computed, ref } from 'vue'
import { masteryOf } from '~/lib/conjugation-drill/master'
import type { VerbClass } from '~/lib/korean'

const STORAGE_KEY = 'conjugation-lab.cleared'
const EARNED_KEY = 'conjugation-lab.masterEarned'
const CLEAR_THRESHOLD = 0.7

function readSet(key: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

export function useConjugationMaster() {
  const cleared = ref<Set<string>>(readSet(STORAGE_KEY))
  const celebrate = ref(false)

  const view = computed(() => masteryOf(cleared.value))
  const perClass = computed(() => view.value.perClass)
  const doneCount = computed(() => view.value.doneCount)
  const total = computed(() => view.value.total)
  const earned = computed(() => view.value.earned)

  /** Call at round end with the class and the round accuracy. */
  function recordRound(klass: VerbClass, accuracy: number) {
    if (accuracy < CLEAR_THRESHOLD) return
    if (cleared.value.has(klass)) return
    const next = new Set(cleared.value)
    next.add(klass)
    cleared.value = next
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
    }
    if (view.value.earned && typeof localStorage !== 'undefined' && !localStorage.getItem(EARNED_KEY)) {
      localStorage.setItem(EARNED_KEY, '1')
      celebrate.value = true
    }
  }

  function dismiss() {
    celebrate.value = false
  }

  return { perClass, doneCount, total, earned, celebrate, recordRound, dismiss }
}
