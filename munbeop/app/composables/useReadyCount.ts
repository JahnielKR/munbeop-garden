import { computed } from 'vue'
import { dueKos, READY_DISPLAY_CAP } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'

/**
 * Reactive "ready to revisit" signal, derived on the fly from the srs store —
 * no persisted state, no migration. `readyKos` is the full due set (for the
 * revisit session); `displayCount`/`hasMore` are the calm, capped surface.
 */
export function useReadyCount() {
  const srs = useSrsStore()
  const readyKos = computed(() => dueKos(srs.map, Date.now()))
  const readyCount = computed(() => readyKos.value.length)
  const displayCount = computed(() => Math.min(readyCount.value, READY_DISPLAY_CAP))
  const hasMore = computed(() => readyCount.value > READY_DISPLAY_CAP)
  return { readyKos, readyCount, displayCount, hasMore }
}
