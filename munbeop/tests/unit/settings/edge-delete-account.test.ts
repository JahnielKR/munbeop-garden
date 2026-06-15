// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const src = readFileSync(
  fileURLToPath(new URL('../../../supabase/functions/delete-account/index.ts', import.meta.url)),
  'utf8',
)

describe('delete-account edge function', () => {
  it('verifies the caller JWT, uses the service role, and deletes the user', () => {
    expect(src).toMatch(/auth\.getUser\(\)/)
    expect(src).toMatch(/SUPABASE_SERVICE_ROLE_KEY/)
    expect(src).toMatch(/auth\.admin\.deleteUser/)
  })
  it('handles CORS preflight', () => {
    expect(src).toMatch(/OPTIONS/)
    expect(src).toMatch(/Access-Control-Allow-Origin/)
  })
})
