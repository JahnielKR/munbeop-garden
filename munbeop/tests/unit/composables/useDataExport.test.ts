import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDataExport } from '~/composables/useDataExport'
import { EXPORT_KEYS } from '~/lib/data-transfer/keys'

// vi.mock is hoisted above imports by vitest, so the mock is registered
// before useDataExport (and its useStorageAdapter import) is evaluated.
const mockRead = vi.fn()
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: mockRead, write: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

describe('useDataExport.collectExportData', () => {
  beforeEach(() => mockRead.mockReset())

  it('reads every export key and assembles a labelled payload', async () => {
    mockRead.mockImplementation(async (key: string) => `value-for-${key}`)
    const payload = await useDataExport().collectExportData()
    expect(payload.app).toBe('munbeop-garden')
    expect(typeof payload.exportedAt).toBe('string')
    expect(Object.keys(payload.data)).toEqual(EXPORT_KEYS)
    expect(payload.data['munbeop.v1.log']).toBe('value-for-munbeop.v1.log')
  })
})
