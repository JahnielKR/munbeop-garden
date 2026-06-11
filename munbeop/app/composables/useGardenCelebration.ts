import { onMounted, ref, watch, type ComputedRef } from 'vue'

/**
 * useGardenCelebration — one-shot milestone celebrations (spec §5.4).
 *
 * Diffs the reached milestones (from useGardenState) against the locally
 * persisted seen-set: every new milestone is marked seen immediately, and
 * the HIGHEST pending one is surfaced exactly once. Thresholds crossed
 * away from the home celebrate the next time the garden opens.
 */

/** UI-side memory — never goes through the storage adapter (spec §5.4). */
const SEEN_KEY = 'garden.milestonesSeen'

export interface Celebration {
  kind: 'sprout' | 'leafy' | 'bloom' | 'tree'
  level: number
}

const RANK: Record<Celebration['kind'], number> = { sprout: 1, leafy: 2, bloom: 3, tree: 4 }

function parseMilestone(key: string): Celebration | null {
  if (key.startsWith('tree:')) {
    const level = Number(key.slice(5))
    return Number.isInteger(level) ? { kind: 'tree', level } : null
  }
  const [lvl, kind] = key.split(':')
  const level = Number(lvl)
  if (!Number.isInteger(level)) return null
  if (kind === 'sprout' || kind === 'leafy' || kind === 'bloom') return { kind, level }
  return null
}

function readSeen(): Set<string> {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export function useGardenCelebration(milestones: ComputedRef<string[]>) {
  const celebration = ref<Celebration | null>(null)
  const ready = ref(false)

  onMounted(() => {
    ready.value = true
  })

  watch(
    [milestones, ready],
    () => {
      if (!ready.value || import.meta.server) return
      const seen = readSeen()
      const pending = milestones.value.filter((k) => !seen.has(k))
      if (pending.length === 0) return

      // Mark EVERYTHING reached as seen (even what we don't surface), so
      // crossing several thresholds at once celebrates only the highest.
      for (const k of milestones.value) seen.add(k)
      window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))

      if (celebration.value) return
      const best = pending
        .map(parseMilestone)
        .filter((c): c is Celebration => c !== null)
        .sort((a, b) => RANK[b.kind] - RANK[a.kind] || b.level - a.level)[0]
      if (best) celebration.value = best
    },
    { immediate: true },
  )

  function dismiss() {
    celebration.value = null
  }

  return { celebration, dismiss }
}
