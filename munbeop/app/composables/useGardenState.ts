import { computed, onMounted } from 'vue'
import { TOPIK_LEVELS, type TopikLevel } from '~/lib/domain'
import { SPECIES_BY_LEVEL, isTreeUnlocked, progressPct, unlockedZoneCount } from '~/lib/garden'
import { TREE_THRESHOLDS, type TreeSpecies } from '~/components/garden/PixelTree.vue'
import { useSrsStore } from '~/stores/srs'
import { useLogStore } from '~/stores/log'
import { useTopikSpine } from '~/composables/useTopikSpine'

/**
 * useGardenState — the single reactive source feeding the whole garden.
 *
 * Everything is DERIVED client-side from the SRS store, the log store and
 * the static TOPIK spine (spec §4): no new tables, identical behavior for
 * anonymous (localStorage) and logged-in (Supabase) users. Stores hydrate
 * in the default layout; until then every tree simply shows its dormant
 * skeleton and reactivity grows it afterwards (plan risk #4 — no spinners).
 *
 * Spec: docs/superpowers/specs/2026-06-11-garden-tree-dashboard.md §4–§5
 */

/** UI preference only — never goes through the storage adapter (spec §5.1). */
const ACTIVE_LEVEL_KEY = 'garden.activeLevel'

export interface GardenLevel {
  level: TopikLevel
  species: TreeSpecies
  /** Level progress 0–100 (spec §4.1 formula). */
  pct: number
  /** Gate of spec §4.3: level 1 always; N needs progress(N-1) ≥ 60. */
  unlocked: boolean
}

export interface GardenZone {
  /** Spine theme id (e.g. "t1_1"). */
  id: string
  /** Theme title from the spine (plain string, shown as-is). */
  title: string
  pct: number
  /** Linear chain of spec §4.4: zone i needs progress(zone i-1) ≥ 50. */
  unlocked: boolean
}

/** i18n suffix for a progress value — keys `garden.state.<suffix>`. */
export function gardenStateKey(pct: number): 'dormant' | 'sprouting' | 'leafy' | 'bloom' {
  if (pct >= TREE_THRESHOLDS.bloom) return 'bloom'
  if (pct >= TREE_THRESHOLDS.leafy) return 'leafy'
  if (pct >= TREE_THRESHOLDS.sprout) return 'sprouting'
  return 'dormant'
}

function isTopikLevel(n: number): n is TopikLevel {
  return (TOPIK_LEVELS as readonly number[]).includes(n)
}

export function useGardenState() {
  const srs = useSrsStore()
  const log = useLogStore()
  const { itemsByLevel, itemsByTheme, themesOfLevel } = useTopikSpine()

  // The curriculum shape is static — memoize the ko lists once per call site
  // so reactive recomputes only re-run the scoring math.
  const kosByLevel = new Map<TopikLevel, string[]>(
    TOPIK_LEVELS.map((l) => [l, itemsByLevel(l).map((i) => i.ko)]),
  )
  const kosByTheme = new Map<string, string[]>()
  const themeKos = (id: string): string[] => {
    let kos = kosByTheme.get(id)
    if (!kos) {
      kos = itemsByTheme(id).map((i) => i.ko)
      kosByTheme.set(id, kos)
    }
    return kos
  }

  const lookup = (ko: string) => srs.map[ko]

  /** The six trees with their real progress + unlock state, in level order. */
  const levels = computed<GardenLevel[]>(() => {
    const pcts = TOPIK_LEVELS.map((l) => progressPct(kosByLevel.get(l) ?? [], lookup))
    return TOPIK_LEVELS.map((l, i) => ({
      level: l,
      species: SPECIES_BY_LEVEL[l],
      pct: pcts[i]!,
      unlocked: isTreeUnlocked(l, (lvl) => pcts[lvl - 1] ?? 0),
    }))
  })

  const highestUnlocked = computed<TopikLevel>(() => {
    let highest: TopikLevel = 1
    for (const l of levels.value) if (l.unlocked) highest = l.level
    return highest
  })

  // Active level = the user's pinned pick (persisted UI pref), capped to
  // what is actually unlocked; default is the highest unlocked level.
  const pick = useState<TopikLevel | null>('garden.activeLevelPick', () => null)

  onMounted(() => {
    if (pick.value !== null) return
    const raw = window.localStorage.getItem(ACTIVE_LEVEL_KEY)
    const n = raw === null ? NaN : Number(raw)
    if (isTopikLevel(n)) pick.value = n
  })

  const activeLevel = computed<TopikLevel>(() => {
    const wanted = pick.value ?? highestUnlocked.value
    const entry = levels.value.find((l) => l.level === wanted)
    return entry?.unlocked ? wanted : highestUnlocked.value
  })

  function setActiveLevel(level: TopikLevel) {
    if (!levels.value.find((l) => l.level === level)?.unlocked) return
    pick.value = level
    if (import.meta.client) window.localStorage.setItem(ACTIVE_LEVEL_KEY, String(level))
  }

  /** The hero tree of the home screen. */
  const active = computed<GardenLevel>(() => levels.value.find((l) => l.level === activeLevel.value) ?? levels.value[0]!)

  /** Hard sentences waiting in the diary — drives the weather (spec §5.3). */
  const pendingReviews = computed(
    () =>
      log.entries.filter(
        (e) => e.reviewState === 'unreviewed' && (e.feedback === 'hard' || e.errorNote),
      ).length,
  )

  /** Most recent practice timestamp across every item; null if never (Bomi sleep rule). */
  const lastPracticedAt = computed<number | null>(() => {
    let last: number | null = null
    for (const state of Object.values(srs.map)) {
      if (state.lastSeen !== null && (last === null || state.lastSeen > last)) last = state.lastSeen
    }
    return last
  })

  /**
   * Reached milestone keys (spec §5.4): `<level>:<sprout|leafy|bloom>` per
   * crossed visual threshold plus `tree:<level>` per unlocked tree (2+).
   * useGardenCelebration diffs these against the locally-seen set.
   */
  const milestones = computed<string[]>(() => {
    const out: string[] = []
    for (const l of levels.value) {
      if (l.pct >= TREE_THRESHOLDS.sprout) out.push(`${l.level}:sprout`)
      if (l.pct >= TREE_THRESHOLDS.leafy) out.push(`${l.level}:leafy`)
      if (l.pct >= TREE_THRESHOLDS.bloom) out.push(`${l.level}:bloom`)
      if (l.level >= 2 && l.unlocked) out.push(`tree:${l.level}`)
    }
    return out
  })

  /** Zones (= spine themes) of the active level, with the chain gate applied. */
  const zones = computed<GardenZone[]>(() => {
    const themes = themesOfLevel(activeLevel.value)
    const pcts = themes.map((t) => progressPct(themeKos(t.id), lookup))
    const open = unlockedZoneCount(pcts)
    return themes.map((t, i) => ({ id: t.id, title: t.title, pct: pcts[i]!, unlocked: i < open }))
  })

  return {
    levels,
    active,
    activeLevel,
    setActiveLevel,
    highestUnlocked,
    pendingReviews,
    lastPracticedAt,
    milestones,
    zones,
    thresholds: TREE_THRESHOLDS,
  }
}
