import { describe, expect, it } from 'vitest'
import { isAccountSyncMessage } from '~/lib/sync/channel'

describe('account sync channel messages', () => {
  it.each([
    'activity-enqueued',
    'activity-acknowledged',
    'journal-mutated',
    'account-data-replaced',
  ])('accepts %s', (type) => {
    expect(isAccountSyncMessage({ type, userId: 'user-a' })).toBe(true)
  })

  it.each([
    null,
    {},
    { type: 'journal-mutated' },
    { type: 'unknown', userId: 'user-a' },
    { type: 'journal-mutated', userId: 1 },
  ])('rejects malformed payload %#', (payload) => {
    expect(isAccountSyncMessage(payload)).toBe(false)
  })
})
