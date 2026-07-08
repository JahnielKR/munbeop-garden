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
    recordRound: (domainId: string, accuracy: number) => m.record(domainId, accuracy),
    dismiss: m.dismiss,
  }
}
