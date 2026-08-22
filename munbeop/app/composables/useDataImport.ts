import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'
import { EXPORT_KEYS, type ExportPayload } from '~/lib/data-transfer/keys'
import type { StorageRestore } from '~/lib/storage'
import { listActivityEvents } from '~/lib/activity/outbox'
import { broadcastAccountSync } from '~/lib/sync/channel'
import { useActivityStore } from '~/stores/activity'
import { useAuthStore } from '~/stores/auth'

/**
 * Restore all present export keys in one adapter operation. Supabase implements
 * this as a PostgreSQL transaction; the caller reloads after a successful call
 * so every store re-hydrates from the restored account state.
 */
export function useDataImport() {
  const { t } = useI18n()
  const toast = useToast()

  async function applyImport(payload: ExportPayload): Promise<boolean> {
    const storage = useStorageAdapter()
    const userId = useAuthStore().user?.id ?? null
    // Presence and value are distinct: an absent key leaves the target intact,
    // while an explicitly exported null clears that collection transactionally.
    const keys = EXPORT_KEYS.filter((key) =>
      Object.prototype.hasOwnProperty.call(payload.data, key),
    )
    if (keys.length === 0) return true

    const data: StorageRestore = {}
    for (const key of keys) data[key] = payload.data[key]

    try {
      // Do not let answers waiting offline land after the imported snapshot and
      // silently alter it. Drain them first; a failed drain keeps both the
      // outbox and the current account data intact so the user can retry.
      if (
        userId &&
        listActivityEvents(userId).length > 0 &&
        !(await useActivityStore().flushPending())
      ) {
        throw new Error('Pending activity could not be synchronized before import')
      }
      await storage.restore(data)
      if (userId) broadcastAccountSync({ type: 'account-data-replaced', userId })
      return true
    } catch {
      toast.error(t('settings.data.import_error'))
      return false
    }
  }

  return { applyImport }
}
