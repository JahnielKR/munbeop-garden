import type { LocalizedString } from '~/lib/domain'
import { USAGE_NOTES as N5_0_USAGE_NOTES } from './shards/n5-0'
import { USAGE_NOTES as N5_1_USAGE_NOTES } from './shards/n5-1'
import { USAGE_NOTES as N5_2_USAGE_NOTES } from './shards/n5-2'
import { USAGE_NOTES as N5_3_USAGE_NOTES } from './shards/n5-3'
import { USAGE_NOTES as N5_4_USAGE_NOTES } from './shards/n5-4'

/** Complete TOPIK 5 usage-note seed. Runtime lookup loads its shards directly. */
export const TOPIK_5_USAGE_NOTES: Record<string, LocalizedString> = {
  ...N5_0_USAGE_NOTES,
  ...N5_1_USAGE_NOTES,
  ...N5_2_USAGE_NOTES,
  ...N5_3_USAGE_NOTES,
  ...N5_4_USAGE_NOTES,
}
