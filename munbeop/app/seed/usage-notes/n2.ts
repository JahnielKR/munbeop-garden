import type { LocalizedString } from '~/lib/domain'
import { USAGE_NOTES as N2_0_USAGE_NOTES } from './shards/n2-0'
import { USAGE_NOTES as N2_1_USAGE_NOTES } from './shards/n2-1'
import { USAGE_NOTES as N2_2_USAGE_NOTES } from './shards/n2-2'

/** Complete TOPIK 2 usage-note seed. Runtime lookup loads its shards directly. */
export const TOPIK_2_USAGE_NOTES: Record<string, LocalizedString> = {
  ...N2_0_USAGE_NOTES,
  ...N2_1_USAGE_NOTES,
  ...N2_2_USAGE_NOTES,
}
