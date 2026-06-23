import type { PlacementItem, TopikLevel } from '~/lib/domain'
import { N1_PLACEMENT } from './n1'
import { N2_PLACEMENT } from './n2'
import { N3_PLACEMENT } from './n3'
import { N4_PLACEMENT } from './n4'
import { N5_PLACEMENT } from './n5'
import { N6_PLACEMENT } from './n6'

export const PLACEMENT_ITEMS_BY_LEVEL: Record<TopikLevel, PlacementItem[]> = {
  1: N1_PLACEMENT,
  2: N2_PLACEMENT,
  3: N3_PLACEMENT,
  4: N4_PLACEMENT,
  5: N5_PLACEMENT,
  6: N6_PLACEMENT,
}

export const PLACEMENT_ITEMS: PlacementItem[] = [
  ...N1_PLACEMENT, ...N2_PLACEMENT, ...N3_PLACEMENT,
  ...N4_PLACEMENT, ...N5_PLACEMENT, ...N6_PLACEMENT,
]
