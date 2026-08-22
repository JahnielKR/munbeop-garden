import type { LocalizedString } from '~/lib/domain'
import { USAGE_NOTES as N3_0_USAGE_NOTES } from './shards/n3-0'
import { USAGE_NOTES as N3_1_USAGE_NOTES } from './shards/n3-1'
import { USAGE_NOTES as N3_2_USAGE_NOTES } from './shards/n3-2'

/** Complete TOPIK 3 usage-note seed. Runtime lookup loads its shards directly. */
export const TOPIK_3_USAGE_NOTES: Record<string, LocalizedString> = {
  ...N3_0_USAGE_NOTES,
  ...N3_1_USAGE_NOTES,
  ...N3_2_USAGE_NOTES,
}
