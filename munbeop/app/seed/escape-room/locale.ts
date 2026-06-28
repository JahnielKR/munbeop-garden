import type { LocalizedString } from '~/lib/domain'
import { TRANSLATIONS } from './translations'

/**
 * Localization helper for the escape-room seed.
 *
 * Content is authored in Spanish — the value passed to `t(es)`. Real per-locale
 * translations live in `./translations/<locale>.ts`, keyed by that exact Spanish
 * source string, and are merged in here. Any string without a translation for a
 * given locale falls back to the Spanish source, so nothing ever renders empty.
 *
 * Korean source-of-truth (the `korean` lines, `answer`s, tile tokens, and the
 * hangul inside hints/cosmetics) is NOT translated and stays identical across
 * locales — pure-Korean strings have no dictionary entry and resolve via the
 * Spanish fallback.
 *
 * Regenerating the dictionaries: `scripts/escape-i18n-extract.mjs` collects every
 * `t(...)` source string and `scripts/escape-i18n-gen.mjs` writes the
 * per-locale `.ts` files. Coverage/parity is enforced by
 * `tests/unit/escape-room/translations.test.ts`.
 */
export const t = (es: string): LocalizedString => ({
  en: TRANSLATIONS.en[es] ?? es,
  es,
  fr: TRANSLATIONS.fr[es] ?? es,
  'pt-BR': TRANSLATIONS['pt-BR'][es] ?? es,
  th: TRANSLATIONS.th[es] ?? es,
  id: TRANSLATIONS.id[es] ?? es,
  vi: TRANSLATIONS.vi[es] ?? es,
  ja: TRANSLATIONS.ja[es] ?? es,
})
