import { readAccountIdentity } from '~/lib/auth/account-epoch'

export interface StudySessionToken {
  ownerUserId: string | null
  accountEpoch: number
}

/**
 * Captures the account that owns an interactive run. A late answer from a page
 * left open through an account change is rejected before it can mutate data.
 */
export function useStudySession() {
  let token: StudySessionToken = capture()

  function capture(): StudySessionToken {
    const identity = readAccountIdentity()
    return { ownerUserId: identity.userId, accountEpoch: identity.epoch }
  }

  function begin(): StudySessionToken {
    token = capture()
    return token
  }

  function isCurrent(): boolean {
    const identity = readAccountIdentity()
    return identity.userId === token.ownerUserId && identity.epoch === token.accountEpoch
  }

  return { begin, isCurrent }
}
