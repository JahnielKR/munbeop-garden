import type { LocalizedString } from '~/lib/domain'

/**
 * Positional constructor for a {@link LocalizedString}.
 * Ordering matches `LOCALE_CODES` in `lib/domain/i18n.ts`:
 * `en, es, fr, pt-BR, th, id, vi, ja`.
 *
 * The positional shape forces every call site to provide all 8 locales —
 * skipping one is a compile error, which is the invariant the runtime relies on.
 */
export const L = (
  en: string,
  es: string,
  fr: string,
  ptBR: string,
  th: string,
  id: string,
  vi: string,
  ja: string,
): LocalizedString => ({ en, es, fr, 'pt-BR': ptBR, th, id, vi, ja })
