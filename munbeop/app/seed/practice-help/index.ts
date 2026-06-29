import type { PracticeHelpContent, PracticeHelpMode } from '~/lib/domain'
import { REGISTER_HELP } from './register'

/** Mode id → explanation content. Modes without an entry simply show no button. */
export const PRACTICE_HELP: Partial<Record<PracticeHelpMode, PracticeHelpContent>> = {
  register: REGISTER_HELP,
}

/** Lookup by raw string so callers (and the v-if) need no cast. */
export function helpFor(mode: string): PracticeHelpContent | undefined {
  return PRACTICE_HELP[mode as PracticeHelpMode]
}
