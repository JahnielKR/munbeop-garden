import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRead = vi.fn()
vi.mock('~/composables/useStorageAdapter', () => ({
  useStorageAdapter: () => ({ read: mockRead, write: vi.fn(), remove: vi.fn(), clear: vi.fn() }),
}))

import { useDataExport } from '~/composables/useDataExport'

describe('useDataExport.collectExportData', () => {
  beforeEach(() => mockRead.mockReset())

  it('reads every export key and assembles a labelled payload', async () => {
    mockRead.mockImplementation(async (key: string) => `value-for-${key}`)
    const payload = await useDataExport().collectExportData()
    expect(payload.app).toBe('munbeop-garden')
    expect(typeof payload.exportedAt).toBe('string')
    expect(Object.keys(payload.data)).toEqual([
      'munbeop.v1.grammar',
      'munbeop.v1.srs',
      'munbeop.v1.log',
      'munbeop.v1.decks',
      'munbeop.v1.customContexts',
      'munbeop.v1.inactiveContextIds',
      'munbeop.v1.settings',
    ])
    expect(payload.data['munbeop.v1.log']).toBe('value-for-munbeop.v1.log')
  })
})
