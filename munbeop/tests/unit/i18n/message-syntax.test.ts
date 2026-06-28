import { describe, it, expect } from 'vitest'
import en from '../../../i18n/locales/en.json'
import es from '../../../i18n/locales/es.json'
import fr from '../../../i18n/locales/fr.json'
import ptBR from '../../../i18n/locales/pt-BR.json'
import th from '../../../i18n/locales/th.json'
import id from '../../../i18n/locales/id.json'
import vi from '../../../i18n/locales/vi.json'
import ja from '../../../i18n/locales/ja.json'

const locales: Record<string, unknown> = { en, es, fr, 'pt-BR': ptBR, th, id, vi, ja }

function leaves(obj: unknown, path = '', out: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof obj === 'string') out.push([path, obj])
  else if (obj && typeof obj === 'object')
    for (const [k, v] of Object.entries(obj)) leaves(v, path ? `${path}.${k}` : k, out)
  return out
}

// The vue-i18n message compiler (unplugin-vue-i18n) treats "@" as linked-message
// syntax and FAILS THE BUILD on an unescaped literal "@" (e.g. an email address).
// A literal must be written as {'@'}. This guards every message so a stray "@"
// can't break `nuxt build` again (lint/typecheck/test don't catch it).
describe('i18n messages are vue-i18n-safe (no unescaped "@")', () => {
  for (const [code, msgs] of Object.entries(locales)) {
    it(`${code} has no bare "@" in any message`, () => {
      const offenders = leaves(msgs)
        .filter(([, v]) => v.replace(/\{'@'\}/g, '').includes('@'))
        .map(([p]) => p)
      expect(offenders, `${code}: escape "@" as {'@'} in ${offenders.join(', ')}`).toEqual([])
    })
  }
})
