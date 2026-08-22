import type { LocalizedString } from '~/lib/domain'
import { USAGE_NOTES as N4_0_USAGE_NOTES } from './shards/n4-0'
import { USAGE_NOTES as N4_1_USAGE_NOTES } from './shards/n4-1'
import { USAGE_NOTES as N4_2_USAGE_NOTES } from './shards/n4-2'
import { USAGE_NOTES as N4_3_USAGE_NOTES } from './shards/n4-3'
import { USAGE_NOTES as N4_4_USAGE_NOTES } from './shards/n4-4'

/** Complete TOPIK 4 usage-note seed. Runtime lookup loads its shards directly. */
export const TOPIK_4_USAGE_NOTES: Record<string, LocalizedString> = {
  ...N4_0_USAGE_NOTES,
  ...N4_1_USAGE_NOTES,
  ...N4_2_USAGE_NOTES,
  ...N4_3_USAGE_NOTES,
  ...N4_4_USAGE_NOTES,
}
