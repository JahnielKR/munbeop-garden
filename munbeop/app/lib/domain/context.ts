import type { LocalizedString } from './i18n'

export interface Context {
  id: string
  /** Short Korean name shown as badge, e.g. "반말". NOT translated. */
  name: string
  /** Mini-scene explaining when this context applies, per locale. */
  scene: LocalizedString
  category: 'formalidad' | 'situacional' | 'custom'
  builtin: boolean
}
