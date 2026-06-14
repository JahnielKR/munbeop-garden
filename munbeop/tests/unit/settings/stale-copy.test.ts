// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function read(rel: string): string {
  return readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
}
const policies = read('../../../app/pages/policies.vue')
const pricing = read('../../../app/pages/pricing.vue')

describe('stale "Local-only" copy is gone', () => {
  it('policies.vue drops the local-only claim and states account sync', () => {
    expect(policies).not.toMatch(/Local-only/i)
    expect(policies).toContain('sync them to your account')
  })
  it('pricing.vue Sprout tier no longer says "Local-only progress"', () => {
    expect(pricing).not.toMatch(/Local-only/i)
  })
})
