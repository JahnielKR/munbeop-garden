import { describe, it, expect } from 'vitest'
import { parseImportPayload } from '~/lib/data-transfer/validate'
import { APP_ID } from '~/lib/data-transfer/keys'
import { STORAGE_KEYS } from '~/lib/storage'

const valid = JSON.stringify({ exportedAt: '2026-01-01', app: APP_ID, data: { [STORAGE_KEYS.log]: [1] } })

describe('parseImportPayload', () => {
  it('accepts a well-formed export', () => {
    const r = parseImportPayload(valid)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.payload.data[STORAGE_KEYS.log]).toEqual([1])
  })
  it('rejects non-JSON with reason json', () => {
    expect(parseImportPayload('not json{')).toEqual({ ok: false, reason: 'json' })
  })
  it('rejects a wrong app stamp with reason app', () => {
    expect(parseImportPayload(JSON.stringify({ app: 'other', data: {} }))).toEqual({ ok: false, reason: 'app' })
  })
  it('rejects a missing/non-object data with reason shape', () => {
    expect(parseImportPayload(JSON.stringify({ app: APP_ID }))).toEqual({ ok: false, reason: 'shape' })
    expect(parseImportPayload(JSON.stringify({ app: APP_ID, data: null }))).toEqual({ ok: false, reason: 'shape' })
  })
  it('rejects a non-object top level with reason shape', () => {
    expect(parseImportPayload('42')).toEqual({ ok: false, reason: 'shape' })
  })
  it('accepts a payload carrying only a subset of keys', () => {
    const r = parseImportPayload(JSON.stringify({ app: APP_ID, data: { [STORAGE_KEYS.settings]: {} } }))
    expect(r.ok).toBe(true)
  })
})
