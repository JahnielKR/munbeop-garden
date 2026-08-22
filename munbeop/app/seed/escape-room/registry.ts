/**
 * Notebook registry facade for lightweight metadata consumers.
 *
 * The registry used to embed every complete story. It now exposes only the
 * lightweight catalog so route shells and global account UI never evaluate
 * rooms, puzzles or narrative dictionaries. The metadata export names remain
 * stable; callers that need a full story must use `loadPlayableLevel()`.
 */
export {
  ESCAPE_LEVEL_CATALOG as LEVEL_REGISTRY,
  escapeLevelCatalogEntry,
  type EscapeLevelCatalogEntry as LevelBookEntry,
  type EscapeLevelStatus as LevelStatus,
} from './catalog'

/*
 * Extraction-only Spanish sources for notebook moods. Full levels already own
 * every other catalog string. Keeping these tiny markers here lets the static
 * i18n manifest retain its source-key contract without importing any runtime
 * translation dictionary into the notebook route.
 */
const t = (source: string) => source
export const ESCAPE_CATALOG_I18N_SOURCES = [
  { id: 'level-01', mood: t('Slice of life · Cálido') },
  { id: 'level-02', mood: t('Místico · Contemplativo') },
  { id: 'level-03', mood: t('Energético · Callejero') },
  { id: 'level-04', mood: t('Urgente · Contemporáneo') },
  { id: 'level-05', mood: t('Nostálgico · Familiar') },
  { id: 'level-06', mood: t('Meta-pop · Divertido') },
  { id: 'level-07', mood: t('Corporativo · Nocturno') },
  { id: 'level-08', mood: t('Histórico · Misterioso') },
  { id: 'level-09', mood: t('Intriga · Denso') },
  { id: 'level-10', mood: t('Diplomático · Tenso') },
] as const
