/**
 * i18n key builder for TOPIK spine theme titles.
 *
 * The spine JSON (`seed/topik-spine.json`) carries a single fixed `title`
 * string per theme (authored in Spanish), which is structural metadata — not
 * a display string. The user-visible theme name must follow the UI locale, so
 * every consumer (the garden tree-zone tooltip, the library filter chip, the
 * study-sheet breadcrumb) resolves the title through i18n keyed by the stable
 * theme id: `garden.theme.<themeId>`.
 *
 * Keeping this in one place means the three call sites can never drift, and a
 * parity test can assert every spine theme id has a key in every locale.
 */
export function themeTitleKey(themeId: string): string {
  return `garden.theme.${themeId}`
}
