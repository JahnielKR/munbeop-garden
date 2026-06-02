import { localized, type LocaleCode, type LocalizedString } from '~/lib/domain'

/**
 * Reactive helper that renders LocalizedString values using the current i18n locale.
 * Usage in template: {{ tl(grammar.meaning) }}
 */
export function useLocalized() {
  const { locale } = useI18n()
  function tl(value: LocalizedString | undefined): string {
    return localized(value, locale.value as LocaleCode)
  }
  return { tl }
}
