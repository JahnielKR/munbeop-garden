import { useStorageAdapter } from '~/composables/useStorageAdapter'
import { useToast } from '~/composables/useToast'
import { APP_ID, EXPORT_KEYS, type ExportPayload } from '~/lib/data-transfer/keys'

/**
 * useDataExport — one-click "take my data" JSON download.
 *
 * collectExportData() reads every syncable key (a complete backup: the user's
 * authored data plus the shared grammar catalog they were using) into one
 * labelled object. downloadJson() turns it into a file the browser saves.
 * exportData() wires the two together with a success/error toast.
 */
export type { ExportPayload }

export function useDataExport() {
  const { t } = useI18n()
  const toast = useToast()

  async function collectExportData(): Promise<ExportPayload> {
    const storage = useStorageAdapter()
    const entries = await Promise.all(
      EXPORT_KEYS.map(async (key) => [key, await storage.read<unknown>(key, null)] as const),
    )
    return {
      exportedAt: new Date().toISOString(),
      app: APP_ID,
      data: Object.fromEntries(entries),
    }
  }

  function downloadJson(obj: unknown, filename: string): void {
    if (typeof document === 'undefined') return
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function exportData(): Promise<void> {
    try {
      const payload = await collectExportData()
      const date = new Date().toISOString().slice(0, 10)
      downloadJson(payload, `mungarden-export-${date}.json`)
      toast.success(t('settings.data.exported'))
    } catch {
      toast.error(t('settings.data.export_error'))
    }
  }

  return { collectExportData, downloadJson, exportData }
}
