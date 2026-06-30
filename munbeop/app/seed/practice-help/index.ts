import type { PracticeHelpContent, PracticeHelpMode } from '~/lib/domain'
import { REGISTER_HELP } from './register'
import { PARTICLES_HELP } from './particles'
import { COUNTERS_HELP } from './counters'
import { CONJUGATION_HELP } from './conjugation'
import { NUMBER_MARKET_HELP } from './number-market'
import { RULETA_HELP } from './ruleta'
import { RESCUE_HELP } from './rescue'
import { CLOZE_HELP } from './cloze'
import { PLACEMENT_HELP } from './placement'

/** Mode id → explanation content. Modes without an entry simply show no button. */
export const PRACTICE_HELP: Partial<Record<PracticeHelpMode, PracticeHelpContent>> = {
  register: REGISTER_HELP,
  particles: PARTICLES_HELP,
  counters: COUNTERS_HELP,
  conjugation: CONJUGATION_HELP,
  'number-market': NUMBER_MARKET_HELP,
  ruleta: RULETA_HELP,
  rescue: RESCUE_HELP,
  cloze: CLOZE_HELP,
  placement: PLACEMENT_HELP,
}

/** Lookup by raw string so callers (and the v-if) need no cast. */
export function helpFor(mode: string): PracticeHelpContent | undefined {
  return PRACTICE_HELP[mode as PracticeHelpMode]
}
