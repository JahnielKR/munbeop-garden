// app/composables/useCounterMaster.ts
import { computed } from 'vue'
import { masteryOf } from '~/lib/counters/sets'
import { useLabMastery } from '~/composables/useLabMastery'

export function useCounterMaster() {
  const m = useLabMastery('counter', masteryOf)
  return {
    perSet: computed(() => m.view.value.perSet),
    doneCount: computed(() => m.view.value.doneCount),
    total: computed(() => m.view.value.total),
    earned: m.earned,
    celebrate: m.celebrate,
    recordRound: (setId: string, accuracy: number) => m.record(setId, accuracy),
    dismiss: m.dismiss,
  }
}
