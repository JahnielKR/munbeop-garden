import type { LocalizedString } from '~/lib/domain'
import { USAGE_NOTES as N6_0_USAGE_NOTES } from './shards/n6-0'
import { USAGE_NOTES as N6_1_USAGE_NOTES } from './shards/n6-1'
import { USAGE_NOTES as N6_2_USAGE_NOTES } from './shards/n6-2'

/** Complete TOPIK 6 usage-note seed. Runtime lookup loads its shards directly. */
export const TOPIK_6_USAGE_NOTES: Record<string, LocalizedString> = {
  ...N6_0_USAGE_NOTES,
  ...N6_1_USAGE_NOTES,
  ...N6_2_USAGE_NOTES,
}
