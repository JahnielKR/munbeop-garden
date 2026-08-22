import type { PracticeHelpContent, PracticeHelpMode } from '~/lib/domain'

type HelpLoader = () => Promise<PracticeHelpContent>

/**
 * Load only the help article the player asks to read.
 *
 * Keeping these imports in a runtime-only module prevents every practice page
 * from downloading the help copy for all eleven games up front.
 */
const HELP_LOADERS: Record<PracticeHelpMode, HelpLoader> = {
  register: () => import('~/seed/practice-help/register').then((m) => m.REGISTER_HELP),
  particles: () => import('~/seed/practice-help/particles').then((m) => m.PARTICLES_HELP),
  counters: () => import('~/seed/practice-help/counters').then((m) => m.COUNTERS_HELP),
  conjugation: () => import('~/seed/practice-help/conjugation').then((m) => m.CONJUGATION_HELP),
  'number-market': () =>
    import('~/seed/practice-help/number-market').then((m) => m.NUMBER_MARKET_HELP),
  ruleta: () => import('~/seed/practice-help/ruleta').then((m) => m.RULETA_HELP),
  rescue: () => import('~/seed/practice-help/rescue').then((m) => m.RESCUE_HELP),
  cloze: () => import('~/seed/practice-help/cloze').then((m) => m.CLOZE_HELP),
  placement: () => import('~/seed/practice-help/placement').then((m) => m.PLACEMENT_HELP),
  'escape-room': () => import('~/seed/practice-help/escape-room').then((m) => m.ESCAPE_ROOM_HELP),
  'sentence-garden': () =>
    import('~/seed/practice-help/sentence-garden').then((m) => m.SENTENCE_GARDEN_HELP),
}

export function loadHelpFor(mode: PracticeHelpMode): Promise<PracticeHelpContent> {
  return HELP_LOADERS[mode]()
}
