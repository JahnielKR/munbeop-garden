/**
 * Garden tree domain constants — the species list, growth thresholds, canvas
 * geometry and layer math for the TOPIK garden tree.
 *
 * Lives in lib (not in PixelTree.vue) so stores / composables / other lib
 * modules can read it without importing upward from a component. PixelTree.vue
 * is one consumer; the zone-anchor + species + garden-state code are others.
 *
 * Asset pipeline: tools/pixel-trees/ (generate_trees.py → 128x160 canvas
 * anchored at (64,148)).
 */

export const TREE_SPECIES = ['cherry', 'magnolia', 'zelkova', 'mugunghwa', 'maple', 'ginkgo'] as const
export type TreeSpecies = (typeof TREE_SPECIES)[number]

/** Progress thresholds (in %) at which each visual layer appears. */
export const TREE_THRESHOLDS = { sprout: 10, leafy: 40, bloom: 80 } as const

/** Generator canvas geometry — single source for stage/zone positioning. */
export const TREE_CANVAS = { width: 128, height: 160, anchorX: 64, anchorY: 148 } as const

export const LAYER_ORDER = [
  'tree_skeleton',
  'trunk_alive',
  'leaves_layer_1',
  'leaves_layer_2',
  'bloom_full',
] as const
export type TreeLayer = (typeof LAYER_ORDER)[number]

/** Cumulative layer stack for a 0–100 progress value. */
export function layersForProgress(progress: number): TreeLayer[] {
  const layers: TreeLayer[] = ['tree_skeleton']
  if (progress >= TREE_THRESHOLDS.sprout) layers.push('trunk_alive', 'leaves_layer_1')
  if (progress >= TREE_THRESHOLDS.leafy) layers.push('leaves_layer_2')
  if (progress >= TREE_THRESHOLDS.bloom) layers.push('bloom_full')
  return layers
}
