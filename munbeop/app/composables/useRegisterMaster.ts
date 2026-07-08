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
    /** Call at round end with the mode, the focused set, and the round accuracy. */
    recordRound: (mode: RegisterMode, set: string, accuracy: number) => {
      if (!isMasterySet(mode, set)) return
      m.record(masteryKey(mode, set), accuracy)
    },
    dismiss: m.dismiss,
  }
}
