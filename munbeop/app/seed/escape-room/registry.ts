import type { Level, LocalizedString, TopikLevel } from '~/lib/domain'
import { t } from './locale'
import { LEVEL_01 } from './level-01'
import { LEVEL_02 } from './level-02'
import { LEVEL_03 } from './level-03'
import { LEVEL_04 } from './level-04'
import { LEVEL_05 } from './level-05'
import { LEVEL_06 } from './level-06'
import { LEVEL_07 } from './level-07'
import { LEVEL_08 } from './level-08'
import { LEVEL_09 } from './level-09'
import { LEVEL_10 } from './level-10'

/**
 * Level registry — the notebook's table of contents.
 *
 * One entry per playable level. The notebook page renders
 * cover + title + tagline + mood; playable entries also surface rewards and
 * attempts pulled from their full `Level` definition.
 *
 * Covers are the final illustrated establishing shots for each closed story.
 *
 * Narrative bible: every level is a closed story (D1). Tone varies on
 * purpose — slice-of-life → mystery → drama → intrigue — so flipping
 * through the notebook feels like browsing very different worlds.
 */

export type LevelStatus = 'playable' | 'coming-soon'

export interface LevelBookEntry {
  id: string
  /** 1-based page number in the notebook. */
  number: number
  title: LocalizedString
  /** Hook shown under the title on the notebook page. */
  tagline: LocalizedString
  /** Short mood descriptor, e.g. "Slice of life · Cálido". */
  mood: LocalizedString
  /** Cover image path under `/escape-room/covers/`. */
  cover: string
  topikLevel: TopikLevel
  status: LevelStatus
  /** Full level definition — only for playable entries. */
  level?: Level
}

export const LEVEL_REGISTRY: LevelBookEntry[] = [
  {
    id: 'level-01',
    number: 1,
    title: LEVEL_01.title,
    tagline: LEVEL_01.tagline,
    mood: t('Slice of life · Cálido'),
    cover: '/escape-room/covers/level-01-v2.webp',
    topikLevel: 1,
    status: 'playable',
    level: LEVEL_01,
  },
  {
    id: 'level-02',
    number: 2,
    title: LEVEL_02.title,
    tagline: LEVEL_02.tagline,
    mood: t('Místico · Contemplativo'),
    cover: '/escape-room/covers/level-02-v2.webp',
    topikLevel: 2,
    status: 'playable',
    level: LEVEL_02,
  },
  {
    id: 'level-03',
    number: 3,
    title: LEVEL_03.title,
    tagline: LEVEL_03.tagline,
    mood: t('Energético · Callejero'),
    cover: '/escape-room/covers/level-03-v2.webp',
    topikLevel: 2,
    status: 'playable',
    level: LEVEL_03,
  },
  {
    id: 'level-04',
    number: 4,
    title: LEVEL_04.title,
    tagline: LEVEL_04.tagline,
    mood: t('Urgente · Contemporáneo'),
    cover: '/escape-room/covers/level-04-v2.webp',
    topikLevel: 3,
    status: 'playable',
    level: LEVEL_04,
  },
  {
    id: 'level-05',
    number: 5,
    title: LEVEL_05.title,
    tagline: LEVEL_05.tagline,
    mood: t('Nostálgico · Familiar'),
    cover: '/escape-room/covers/level-05-v2.webp',
    topikLevel: 3,
    status: 'playable',
    level: LEVEL_05,
  },
  {
    id: 'level-06',
    number: 6,
    title: LEVEL_06.title,
    tagline: LEVEL_06.tagline,
    mood: t('Meta-pop · Divertido'),
    cover: '/escape-room/covers/level-06-v2.webp',
    topikLevel: 4,
    status: 'playable',
    level: LEVEL_06,
  },
  {
    id: 'level-07',
    number: 7,
    title: LEVEL_07.title,
    tagline: LEVEL_07.tagline,
    mood: t('Corporativo · Nocturno'),
    cover: '/escape-room/covers/level-07-v2.webp',
    topikLevel: 4,
    status: 'playable',
    level: LEVEL_07,
  },
  {
    id: 'level-08',
    number: 8,
    title: LEVEL_08.title,
    tagline: LEVEL_08.tagline,
    mood: t('Histórico · Misterioso'),
    cover: '/escape-room/covers/level-08-v2.webp',
    topikLevel: 5,
    status: 'playable',
    level: LEVEL_08,
  },
  {
    id: 'level-09',
    number: 9,
    title: LEVEL_09.title,
    tagline: LEVEL_09.tagline,
    mood: t('Intriga · Denso'),
    cover: '/escape-room/covers/level-09-v2.webp',
    topikLevel: 5,
    status: 'playable',
    level: LEVEL_09,
  },
  {
    id: 'level-10',
    number: 10,
    title: LEVEL_10.title,
    tagline: LEVEL_10.tagline,
    mood: t('Diplomático · Tenso'),
    cover: '/escape-room/covers/level-10-v2.webp',
    topikLevel: 6,
    status: 'playable',
    level: LEVEL_10,
  },
]

/** Find a playable level's full definition by id. */
export function playableLevel(id: string): Level | null {
  const entry = LEVEL_REGISTRY.find((e) => e.id === id)
  return entry?.status === 'playable' && entry.level ? entry.level : null
}
