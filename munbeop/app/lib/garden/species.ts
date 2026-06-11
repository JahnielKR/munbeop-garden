import type { TreeSpecies } from '~/components/garden/PixelTree.vue'
import type { TopikLevel } from '~/lib/domain'

/**
 * Level ↔ species mapping and per-species metadata for the TOPIK garden.
 *
 * Spec: docs/superpowers/specs/2026-06-11-garden-tree-dashboard.md §3 —
 * spectacle scales with the level so every unlock feels like an achievement.
 */

export const SPECIES_BY_LEVEL: Record<TopikLevel, TreeSpecies> = {
  1: 'cherry',
  2: 'magnolia',
  3: 'zelkova',
  4: 'mugunghwa',
  5: 'maple',
  6: 'ginkgo',
}

/** Korean tree names — shown as-is in every locale (never translated). */
export const SPECIES_KO: Record<TreeSpecies, string> = {
  cherry: '벚꽃',
  magnolia: '목련',
  zelkova: '느티나무',
  mugunghwa: '무궁화',
  maple: '단풍나무',
  ginkgo: '은행나무',
}

/** Particle sprite used for each species' celebration burst / ambient fall. */
export const SPECIES_PARTICLE: Record<TreeSpecies, string> = {
  cherry: '/img/tree/particles/petal_pink.png',
  magnolia: '/img/tree/particles/petal_pink.png',
  zelkova: '/img/tree/particles/leaf_gold.png',
  mugunghwa: '/img/tree/particles/petal_pink.png',
  maple: '/img/tree/particles/leaf_red.png',
  ginkgo: '/img/tree/particles/leaf_gold.png',
}
