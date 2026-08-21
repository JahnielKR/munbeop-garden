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
    saveStatus: m.saveStatus,
    saving: m.saving,
    saveError: m.saveError,
    locked: m.locked,
    recordRound: (setId: string, accuracy: number) => m.record(setId, accuracy),
    retrySave: m.retrySave,
    resetSaveStatus: m.resetSaveStatus,
    dismiss: m.dismiss,
  }
}
