import type { LocaleCode, LocalizedString } from '~/lib/domain'

export type EscapeTranslationLocale = Exclude<LocaleCode, 'es'>

/**
 * The Spanish seed copy is the source of truth. A playable level receives only
 * its own seven target-locale dictionaries, then materializes the eight-locale
 * value expected by the domain model. Keeping this helper independent from the
 * aggregate translation index is what preserves the per-level bundle boundary.
 */
export type EscapeLevelTranslations = Readonly<
  Record<EscapeTranslationLocale, Readonly<Record<string, string>>>
>

export function createEscapeTranslator(translations: EscapeLevelTranslations) {
  return (es: string): LocalizedString => ({
    en: translations.en[es] ?? es,
    es,
    fr: translations.fr[es] ?? es,
    'pt-BR': translations['pt-BR'][es] ?? es,
    th: translations.th[es] ?? es,
    id: translations.id[es] ?? es,
    vi: translations.vi[es] ?? es,
    ja: translations.ja[es] ?? es,
  })
}
