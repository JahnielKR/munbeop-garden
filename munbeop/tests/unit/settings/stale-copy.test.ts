// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function read(rel: string): string {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
}
const policies = read('../../../app/pages/policies.vue')
const pricing = read('../../../app/pages/pricing.vue')
// The page bodies now live in i18n (localized across 8 locales), so the
// account-sync claim is asserted against the English catalog, not the .vue.
const en = read('../../../i18n/locales/en.json')

describe('stale "Local-only" copy is gone', () => {
  it('policies.vue drops the local-only claim', () => {
    expect(policies).not.toMatch(/Local-only/i)
  })
  it('the privacy policy states account sync (not the old local-only lie)', () => {
    expect(en).not.toMatch(/Local-only/i)
    expect(en).toContain('sync them to your account')
  })
  it('pricing.vue Sprout tier no longer says "Local-only progress"', () => {
    expect(pricing).not.toMatch(/Local-only/i)
  })
})
