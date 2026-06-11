import type { LocalizedString } from '~/lib/domain'

/**
 * V1 localization stub for the escape-room seed.
 *
 * Per decisión D12 in `docs/escape-room.md`, V1 ships textual content in
 * Spanish only — but the `LocalizedString` shape (all 8 locales) is reserved
 * from day one to avoid a future migration.
 *
 * This helper duplicates the Spanish string to all 8 locales. Non-Spanish
 * users see the Spanish text instead of an empty string until translators
 * land per-locale values.
 *
 * Translators / future-self: every `t(...)` call site below is a string
 * pending translation. Grep `t(` inside `app/seed/escape-room/` to find them.
 */
export const t = (es: string): LocalizedString => ({
  en: es,
  es,
  fr: es,
  'pt-BR': es,
  th: es,
  id: es,
  vi: es,
  ja: es,
})
