<!-- app/components/settings/DataImport.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import { useToast } from '~/composables/useToast'
import { parseImportPayload } from '~/lib/data-transfer/validate'
import { reloadPage } from '~/lib/data-transfer/reload'
import { useDataImport } from '~/composables/useDataImport'
import type { ExportPayload } from '~/lib/data-transfer/keys'

const { t } = useI18n()
const toast = useToast()
const { applyImport } = useDataImport()

const fileInput = ref<HTMLInputElement | null>(null)
const pending = ref<ExportPayload | null>(null)
const confirmOpen = ref(false)

function pickFile() {
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // allow re-selecting the same file
  if (!file) return
  let text: string
  try {
    text = await file.text()
  } catch {
    toast.error(t('settings.data.import_error'))
    return
  }
  const result = parseImportPayload(text)
  if (!result.ok) {
    toast.error(t('settings.data.import_invalid'))
    return
  }
  pending.value = result.payload
  confirmOpen.value = true
}

async function confirmImport() {
  if (!pending.value) return
  const ok = await applyImport(pending.value)
  confirmOpen.value = false
  pending.value = null
  if (ok) reloadPage()
}

function cancelImport() {
  confirmOpen.value = false
  pending.value = null
}
</script>

<template>
  <div class="data-import">
    <Button size="sm" data-testid="import-btn" @click="pickFile">{{ t('settings.data.import') }}</Button>
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      class="data-import__input"
      data-testid="import-file"
      @change="onFileChange"
    >
    <Modal
      :open="confirmOpen"
      :title="t('settings.data.import_confirm_title')"
      :close-label="t('settings.data.import_confirm_cta')"
      @close="cancelImport"
    >
      <p class="data-import__body">{{ t('settings.data.import_confirm_body') }}</p>
      <div class="data-import__actions">
        <Button size="sm" data-testid="import-confirm" @click="confirmImport">
          {{ t('settings.data.import_confirm_cta') }}
        </Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.data-import { display: contents; }
.data-import__input { display: none; }
.data-import__body { margin: 0 0 16px; font-family: var(--font-ui); color: var(--text); line-height: 1.6; }
.data-import__actions { display: flex; justify-content: flex-end; }
</style>
