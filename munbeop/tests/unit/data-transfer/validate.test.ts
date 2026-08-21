import { describe, expect, it } from 'vitest'
import { parseImportPayload, MAX_IMPORT_BYTES } from '~/lib/data-transfer/validate'
import { APP_ID, EXPORT_KEYS } from '~/lib/data-transfer/keys'
import { STORAGE_KEYS } from '~/lib/storage'

const logEntry = {
  id: 1,
  ko: '-고 싶다',
  sentence: '한국에 가고 싶어요.',
  feedback: 'easy',
  errorNote: null,
  reviewState: 'unreviewed',
  contextId: 'polite',
  contextName: '존댓말',
  date: '2026-01-01T00:00:00.000Z',
}
const valid = JSON.stringify({
  exportedAt: '2026-01-01T00:00:00.000Z',
  app: APP_ID,
  data: { [STORAGE_KEYS.log]: [logEntry] },
})

describe('parseImportPayload', () => {
  it('accepts a well-formed export', () => {
    const result = parseImportPayload(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.payload.data[STORAGE_KEYS.log]).toEqual([logEntry])
  })

  it('rejects non-JSON with reason json', () => {
    expect(parseImportPayload('not json{')).toEqual({ ok: false, reason: 'json' })
  })

  it('rejects a wrong app stamp with reason app', () => {
    expect(parseImportPayload(JSON.stringify({ app: 'other', data: {} }))).toEqual({
      ok: false,
      reason: 'app',
    })
  })

  it('rejects a missing or non-object data value', () => {
    expect(parseImportPayload(JSON.stringify({ app: APP_ID }))).toEqual({
      ok: false,
      reason: 'shape',
    })
    expect(parseImportPayload(JSON.stringify({ app: APP_ID, data: null }))).toEqual({
      ok: false,
      reason: 'shape',
    })
    expect(parseImportPayload('42')).toEqual({ ok: false, reason: 'shape' })
  })

  it('rejects malformed nested rows before they reach a storage adapter', () => {
    const malformed = JSON.stringify({
      app: APP_ID,
      data: { [STORAGE_KEYS.log]: [{ ...logEntry, feedback: 'maybe' }] },
    })
    expect(parseImportPayload(malformed)).toEqual({ ok: false, reason: 'shape' })
  })

  it('rejects fractional deck positions before PostgreSQL integer casts', () => {
    const malformed = JSON.stringify({
      app: APP_ID,
      data: {
        [STORAGE_KEYS.decks]: [
          { id: 'a', name: 'A', colorId: 'sky', order: 1.5, collapsed: false },
        ],
      },
    })
    expect(parseImportPayload(malformed)).toEqual({ ok: false, reason: 'shape' })
  })

  it('accepts null as an explicit absent value and a subset of keys', () => {
    const result = parseImportPayload(
      JSON.stringify({
        app: APP_ID,
        data: { [STORAGE_KEYS.settings]: {}, [STORAGE_KEYS.customDecks]: null },
      }),
    )
    expect(result.ok).toBe(true)
  })

  it('rejects oversized imports before parsing JSON', () => {
    expect(parseImportPayload(' '.repeat(MAX_IMPORT_BYTES + 1))).toEqual({
      ok: false,
      reason: 'size',
    })
  })

  it('backs up all user-authored and progress collections', () => {
    expect(EXPORT_KEYS).toEqual(
      expect.arrayContaining([STORAGE_KEYS.customDecks, STORAGE_KEYS.activity]),
    )
  })
})
