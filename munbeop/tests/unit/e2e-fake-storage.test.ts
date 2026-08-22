import { beforeEach, describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import type { AuthUser } from '~/lib/auth/types'
import { STORAGE_KEYS } from '~/lib/storage/keys'
import { pickAdapter } from '../e2e/fixtures/storage-facade'
import { readBackend, userIdForEmail, writeBackend } from '../e2e/fixtures/backend'
import { accountData, logEntry } from '../e2e/support'

describe('E2E fake storage', () => {
  beforeEach(() => localStorage.clear())

  it('restores the journal and rebuilds progress instead of trusting imported mastery', async () => {
    const email = 'restore-unit@example.test'
    const userId = userIdForEmail(email)
    writeBackend({
      version: 1,
      accounts: {
        [userId]: {
          email,
          data: accountData([logEntry(1)]),
          failReadsRemaining: 0,
          activityReceipts: {},
          journalDeletes: {},
        },
      },
    })
    const adapter = pickAdapter({ user: { id: userId } as AuthUser, client: null })

    await adapter.restore(
      reactive(
        accountData([
          logEntry(2, { reviewState: 'correct' }),
          logEntry(3, { ko: '이/가', feedback: 'hard', errorNote: 'Subject' }),
        ]),
      ),
    )

    const data = readBackend().accounts[userId]!.data
    expect(data[STORAGE_KEYS.log]).toHaveLength(2)
    expect(data[STORAGE_KEYS.srs]).toMatchObject({
      '은/는': { easyCount: 1, hardCount: 0, mastery: 'seedling' },
      '이/가': { easyCount: 0, hardCount: 1, mastery: 'seedling' },
    })
  })
})
