import type { TreeSpecies } from '~/components/garden/PixelTree.vue'

/**
 * Zone-node anchors per species — % positions over the 128×160 tree canvas,
 * ordered like the spine themes: zone 1 = the lowest branch, last = the top.
 *
 * Derived from the crown-clump geometry in tools/pixel-trees/generate_trees.py
 * (the SPECIES dict is the source of truth for silhouettes). If a species is
 * regenerated with a different silhouette, recalibrate with the click helper
 * in tools/pixel-trees/preview.html ("calibrate anchors" checkbox).
 *
 * Levels have 7/11/7/7/6/5 themes; every species carries 7 anchors and
 * TreeZones groups any overflow into the last node (spec §4.4 "y más…").
 *
 * Lives in lib/ (not components/) because Nuxt's component scanner would
 * otherwise resolve tree-zones.ts and TreeZones.vue to the same name.
 */
export interface ZoneAnchor {
  top: string
  left: string
}

export const ZONE_ANCHORS: Record<TreeSpecies, ZoneAnchor[]> = {
  cherry: [
    { top: '65%', left: '36%' },
    { top: '64%', left: '65%' },
    { top: '57%', left: '31%' },
    { top: '56%', left: '70%' },
    { top: '51%', left: '42%' },
    { top: '50%', left: '58%' },
    { top: '41%', left: '50%' },
  ],
  magnolia: [
    { top: '58%', left: '31%' },
    { top: '57%', left: '70%' },
    { top: '50%', left: '37%' },
    { top: '49%', left: '63%' },
    { top: '44%', left: '44%' },
    { top: '43%', left: '55%' },
    { top: '36%', left: '50%' },
  ],
  zelkova: [
    { top: '59%', left: '23%' },
    { top: '59%', left: '77%' },
    { top: '54%', left: '33%' },
    { top: '54%', left: '67%' },
    { top: '45%', left: '39%' },
    { top: '45%', left: '61%' },
    { top: '36%', left: '50%' },
  ],
  mugunghwa: [
    { top: '68%', left: '43%' },
    { top: '67%', left: '57%' },
    { top: '61%', left: '38%' },
    { top: '62%', left: '66%' },
    { top: '58%', left: '47%' },
    { top: '58%', left: '57%' },
    { top: '51%', left: '51%' },
  ],
  maple: [
    { top: '58%', left: '30%' },
    { top: '59%', left: '50%' },
    { top: '58%', left: '71%' },
    { top: '51%', left: '38%' },
    { top: '51%', left: '63%' },
    { top: '44%', left: '45%' },
    { top: '44%', left: '55%' },
  ],
  ginkgo: [
    { top: '69%', left: '43%' },
    { top: '69%', left: '58%' },
    { top: '58%', left: '47%' },
    { top: '56%', left: '56%' },
    { top: '45%', left: '45%' },
    { top: '44%', left: '53%' },
    { top: '33%', left: '50%' },
  ],
}

/** Diary chest anchor (by the roots) — same canvas %, shared by all species. */
export const CHEST_ANCHOR: ZoneAnchor = { top: '91%', left: '26%' }
