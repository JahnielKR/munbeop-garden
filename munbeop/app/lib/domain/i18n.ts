export const LOCALE_CODES = ['en', 'es', 'fr', 'pt-BR', 'th', 'id', 'vi', 'ja'] as const

export type LocaleCode = (typeof LOCALE_CODES)[number]

export const DEFAULT_LOCALE: LocaleCode = 'en'

/**
 * A string with translations per supported locale.
 * Every supported locale must have a value (no partials in seed data).
 */
export type LocalizedString = Record<LocaleCode, string>

/**
 * Render a LocalizedString in the requested locale, falling back to DEFAULT_LOCALE,
 * then to the first non-empty entry, then to ''.
 */
export function localized(value: LocalizedString | undefined, locale: LocaleCode): string {
  if (!value) return ''
  const v = value[locale]
  if (v) return v
  const fb = value[DEFAULT_LOCALE]
  if (fb) return fb
  for (const code of LOCALE_CODES) {
    const x = value[code]
    if (x) return x
  }
  return ''
}
