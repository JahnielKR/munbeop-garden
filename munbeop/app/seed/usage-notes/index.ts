import type { LocalizedString } from '~/lib/domain'
import { TOPIK_1_USAGE_NOTES } from './n1'
import { TOPIK_2_USAGE_NOTES } from './n2'
import { TOPIK_3_USAGE_NOTES } from './n3'
import { TOPIK_4_USAGE_NOTES } from './n4'
import { TOPIK_5_USAGE_NOTES } from './n5'
import { TOPIK_6_USAGE_NOTES } from './n6'

/**
 * Aggregated usage-notes catalog, keyed by Grammar.ko. Per-level records are
 * merged in; kos are unique across the catalog so there are no collisions.
 *
 * Lives outside the ~893 KB grammar seed (which only loads as a first-run
 * fallback) so the study sheet can look notes up by ko without dragging the
 * whole catalog into the library chunk — the same shape as grammar-examples
 * and pronunciation.
 */
export const USAGE_NOTES: Record<string, LocalizedString> = {
  ...TOPIK_1_USAGE_NOTES,
  ...TOPIK_2_USAGE_NOTES,
  ...TOPIK_3_USAGE_NOTES,
  ...TOPIK_4_USAGE_NOTES,
  ...TOPIK_5_USAGE_NOTES,
  ...TOPIK_6_USAGE_NOTES,
}
