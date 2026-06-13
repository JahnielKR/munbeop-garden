import type { Level, LocalizedString, TopikLevel } from '~/lib/domain'
import { t } from './locale'
import { LEVEL_01 } from './level-01'
import { LEVEL_02 } from './level-02'

/**
 * Level registry — the notebook's table of contents.
 *
 * One entry per level (playable or announced). The notebook page renders
 * cover + title + tagline + mood; playable entries also surface rewards and
 * attempts pulled from their full `Level` definition.
 *
 * Covers are placeholder pixel-art concepts (AI-generated) chosen for tonal
 * direction — final art replaces them file-by-file without touching code.
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
    cover: '/escape-room/covers/level-01.png',
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
    cover: '/escape-room/covers/level-02.png',
    topikLevel: 2,
    status: 'playable',
    level: LEVEL_02,
  },
  {
    id: 'level-03',
    number: 3,
    title: t('El mercado nocturno'),
    tagline: t(
      'Entre letreros de neón y vapor de tteokbokki, una ajumma te retiene la mochila: "Me ayudas a cerrar el puesto, y te la devuelvo." El mercado cierra en veinte minutos.',
    ),
    mood: t('Energético · Callejero'),
    cover: '/escape-room/covers/level-03.png',
    topikLevel: 2,
    status: 'coming-soon',
  },
  {
    id: 'level-04',
    number: 4,
    title: t('El último tren a Seúl'),
    tagline: t(
      'Las 23:47. El último KTX sale en trece minutos, tu billete está en coreano, y el andén que dice tu app no existe. Un guardia de estación muy paciente es tu única esperanza.',
    ),
    mood: t('Urgente · Contemporáneo'),
    cover: '/escape-room/covers/level-04.png',
    topikLevel: 3,
    status: 'coming-soon',
  },
  {
    id: 'level-05',
    number: 5,
    title: t('La cocina del abuelo'),
    tagline: t(
      'Tu abuelo ya no recuerda muchas cosas. Pero dejó su receta de doenjang-jjigae escrita en libretas por toda la cocina — y tu madre quiere que la cocines tú, esta noche, exactamente como él.',
    ),
    mood: t('Nostálgico · Familiar'),
    cover: '/escape-room/covers/level-05.png',
    topikLevel: 3,
    status: 'coming-soon',
  },
  {
    id: 'level-06',
    number: 6,
    title: t('El estudio de K-drama'),
    tagline: t(
      'Eres extra en un drama de verano y el actor principal no llegó. La directora te mira fijo: "Tú. Sabes coreano, ¿no?" El guion está lleno de marcas que no entiendes. Luces. Cámara.',
    ),
    mood: t('Meta-pop · Divertido'),
    cover: '/escape-room/covers/level-06.png',
    topikLevel: 4,
    status: 'coming-soon',
  },
  {
    id: 'level-07',
    number: 7,
    title: t('El retiro de la empresa'),
    tagline: t(
      'Tu primer workshop con la oficina de Gangnam: montaña, fogata y juegos de equipo. El director ha escondido los premios del equipo por el campamento — y todas las pistas están en lenguaje formal.',
    ),
    mood: t('Corporativo · Nocturno'),
    cover: '/escape-room/covers/level-07.png',
    topikLevel: 4,
    status: 'coming-soon',
  },
  {
    id: 'level-08',
    number: 8,
    title: t('El palacio de las linternas'),
    tagline: t(
      'La noche del festival, el palacio Joseon abre sus puertas una vez al año. Te quedaste dentro después del cierre — y los pasillos iluminados por linternas parecen reordenarse cuando no miras.',
    ),
    mood: t('Histórico · Misterioso'),
    cover: '/escape-room/covers/level-08.png',
    topikLevel: 5,
    status: 'coming-soon',
  },
  {
    id: 'level-09',
    number: 9,
    title: t('La mansión del testamento'),
    tagline: t(
      'El magnate murió a medianoche y tú eres el intérprete del testamento. Siete herederos, una mansión victoriana en las afueras de Seúl, y un documento que cambia de sentido según cómo se lea cada cláusula.',
    ),
    mood: t('Intriga · Denso'),
    cover: '/escape-room/covers/level-09.png',
    topikLevel: 5,
    status: 'coming-soon',
  },
  {
    id: 'level-10',
    number: 10,
    title: t('La cumbre de medianoche'),
    tagline: t(
      'Dos delegaciones, un castillo neutral, y un comunicado conjunto que debe firmarse antes del amanecer. Cada palabra del borrador importa. Tú sostienes la pluma.',
    ),
    mood: t('Diplomático · Tenso'),
    cover: '/escape-room/covers/level-10.png',
    topikLevel: 6,
    status: 'coming-soon',
  },
]

/** Find a playable level's full definition by id. */
export function playableLevel(id: string): Level | null {
  const entry = LEVEL_REGISTRY.find((e) => e.id === id)
  return entry?.status === 'playable' && entry.level ? entry.level : null
}
