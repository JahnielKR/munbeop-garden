// app/composables/useNumberMarketMaster.ts
import { computed } from 'vue'
import { masteryOf } from '~/lib/numbers-market/sets'
import { useLabMastery } from '~/composables/useLabMastery'

export function useNumberMarketMaster() {
  const m = useLabMastery('numberMarket', masteryOf)
  return {
    perDomain: computed(() => m.view.value.perDomain),
    doneCount: computed(() => m.view.value.doneCount),
    total: computed(() => m.view.value.total),
    earned: m.earned,
    celebrate: m.celebrate,
    saveStatus: m.saveStatus,
    saving: m.saving,
    saveError: m.saveError,
    locked: m.locked,
    recordRound: (domainId: string, accuracy: number) => m.record(domainId, accuracy),
    retrySave: m.retrySave,
    resetSaveStatus: m.resetSaveStatus,
    dismiss: m.dismiss,
  }
}
