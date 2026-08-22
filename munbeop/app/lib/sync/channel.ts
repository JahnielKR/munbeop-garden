export type AccountSyncMessage =
  | { type: 'activity-enqueued'; userId: string }
  | { type: 'activity-acknowledged'; userId: string }
  | { type: 'journal-mutated'; userId: string }
  | { type: 'account-data-replaced'; userId: string }

const CHANNEL_NAME = 'munbeop-account-sync-v1'
let channel: BroadcastChannel | null | undefined

function getChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel
  channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME)
  return channel
}

export function broadcastAccountSync(message: AccountSyncMessage): void {
  try {
    getChannel()?.postMessage(message)
  } catch {
    // Local persistence remains authoritative; focus/online also retry sync.
  }
}

export function isAccountSyncMessage(value: unknown): value is AccountSyncMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const message = value as { type?: unknown; userId?: unknown }
  return (
    typeof message.userId === 'string' &&
    [
      'activity-enqueued',
      'activity-acknowledged',
      'journal-mutated',
      'account-data-replaced',
    ].includes(String(message.type))
  )
}

export function subscribeAccountSync(listener: (message: AccountSyncMessage) => void): () => void {
  const active = getChannel()
  if (!active) return () => {}
  const receive = (event: MessageEvent<unknown>) => {
    if (isAccountSyncMessage(event.data)) listener(event.data)
  }
  active.addEventListener('message', receive)
  return () => active.removeEventListener('message', receive)
}
