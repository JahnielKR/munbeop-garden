// New key namespace — legacy used `ruleta_v2_*`; we deliberately break compatibility.
// The legacy importer (Plan 10) will read old keys and write new ones.

export const STORAGE_KEYS = {
  grammar: 'munbeop.v1.grammar',
  srs: 'munbeop.v1.srs',
  log: 'munbeop.v1.log',
  decks: 'munbeop.v1.decks',
  customContexts: 'munbeop.v1.customContexts',
  inactiveContextIds: 'munbeop.v1.inactiveContextIds',
  locale: 'munbeop.v1.locale',
  settings: 'munbeop.v1.settings',
  escapeRoom: 'munbeop.v1.escapeRoom',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
