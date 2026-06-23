import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'
import { EXPORT_KEYS, type ExportPayload } from '~/lib/data-transfer/keys'

/**
 * useDataImport — restore a useDataExport backup.
 *
 * applyImport() overwrites each present export key from the payload. The caller
 * reloads on success so every store re-hydrates from the restored storage.
 */
export function useDataImport() {
  const { t } = useI18n()
  const toast = useToast()

  async function applyImport(payload: ExportPayload): Promise<boolean> {
    try {
      const storage = useStorageAdapter()
      for (const key of EXPORT_KEYS) {
        const value = payload.data[key]
        if (value !== undefined) await storage.write(key, value)
      }
      return true
    } catch {
      toast.error(t('settings.data.import_error'))
      return false
    }
  }

  return { applyImport }
}
