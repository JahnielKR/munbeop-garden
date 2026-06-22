import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import id from '../../../i18n/locales/id.json'
import ja from '../../../i18n/locales/ja.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import vi from '../../../i18n/locales/vi.json'

const LOCALES = { en, es, fr, id, ja, ptBR, th, vi }

describe('library.examples.play_audio i18n', () => {
  it('every locale has a non-empty play_audio label', () => {
    for (const [name, loc] of Object.entries(LOCALES)) {
      const v = (loc.library as Record<string, Record<string, string>>)?.examples?.play_audio
      expect({ name, ok: typeof v === 'string' && v.length > 0 }).toEqual({ name, ok: true })
    }
  })
})
