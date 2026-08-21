import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'
import { EXPORT_KEYS, type ExportPayload } from '~/lib/data-transfer/keys'
import type { StorageRestore } from '~/lib/storage'

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
    const keys = EXPORT_KEYS.filter((key) => payload.data[key] !== undefined)
    if (keys.length === 0) return true

    const data: StorageRestore = {}
    for (const key of keys) data[key] = payload.data[key]

    try {
      await storage.restore(data)
      return true
    } catch {
      toast.error(t('settings.data.import_error'))
      return false
    }
  }

  return { applyImport }
}
