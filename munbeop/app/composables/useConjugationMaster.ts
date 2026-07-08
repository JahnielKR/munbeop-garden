// app/composables/useConjugationMaster.ts
import { computed } from 'vue'
import { masteryOf } from '~/lib/conjugation-drill/master'
import { useLabMastery } from '~/composables/useLabMastery'
import type { VerbClass } from '~/lib/korean'

export function useConjugationMaster() {
  const m = useLabMastery('conjugation', masteryOf)
  return {
    perClass: computed(() => m.view.value.perClass),
    doneCount: computed(() => m.view.value.doneCount),
    total: computed(() => m.view.value.total),
    earned: m.earned,
    celebrate: m.celebrate,
    /** Call at round end with the class and the round accuracy. */
    recordRound: (klass: VerbClass, accuracy: number) => m.record(klass, accuracy),
    dismiss: m.dismiss,
  }
}
