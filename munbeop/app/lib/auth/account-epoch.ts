export interface AccountIdentity {
  userId: string | null
  epoch: number
}

let current: AccountIdentity = { userId: null, epoch: 0 }

/** Publish the identity synchronously before any account-scoped I/O begins. */
export function publishAccountIdentity(userId: string | null): AccountIdentity {
  if (current.userId !== userId) current = { userId, epoch: current.epoch + 1 }
  return current
}

export function readAccountIdentity(): AccountIdentity {
  return current
}
