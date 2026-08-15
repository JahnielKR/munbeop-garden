// app/composables/useRegisterMaster.ts
import { computed } from 'vue'
import { masteryOf, masteryKey, isMasterySet } from '~/lib/register-transform'
import { useLabMastery } from '~/composables/useLabMastery'
import type { RegisterMode } from '~/lib/domain'

export function useRegisterMaster() {
  const m = useLabMastery('register', masteryOf)
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
    /** Call at round end with the mode, the focused set, and the round accuracy. */
    recordRound: (mode: RegisterMode, set: string, accuracy: number): Promise<boolean> => {
      if (!isMasterySet(mode, set)) return Promise.resolve(true)
      return m.record(masteryKey(mode, set), accuracy)
    },
    retrySave: m.retrySave,
    resetSaveStatus: m.resetSaveStatus,
    dismiss: m.dismiss,
  }
}
