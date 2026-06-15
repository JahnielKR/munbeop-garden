// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const cfg = readFileSync(
  fileURLToPath(new URL('../../../supabase/config.toml', import.meta.url)),
  'utf8',
)

describe('supabase config.toml', () => {
  it('pins verify_jwt = false for the delete-account function', () => {
    expect(cfg).toMatch(/\[functions\.delete-account\]/)
    expect(cfg).toMatch(/verify_jwt\s*=\s*false/)
  })
})
