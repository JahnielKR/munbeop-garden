import { computed } from 'vue'
import { detectLeeches, type Leech } from '~/lib/srs'
import { useGrammarStore } from '~/stores/grammar'
import { useLogStore } from '~/stores/log'

/**
 * Reactive struggling-plant ("leech") signal, derived on the fly from the log
 * and catalog — no persisted state, no migration. `leeches` is the ordered list
 * for display; `leechKos` is the fast membership set for the session cap and the
 * in-ruleta rescue offer.
 */
export function useLeeches() {
  const logStore = useLogStore()
  const grammarStore = useGrammarStore()

  const leeches = computed<Leech[]>(() => detectLeeches(logStore.entries, grammarStore.items))
  const leechKos = computed(() => new Set(leeches.value.map((l) => l.ko)))

  return { leeches, leechKos }
}
