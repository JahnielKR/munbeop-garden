<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import Modal from '~/components/ui/Modal.vue'
import Field from '~/components/ui/Field.vue'
import Input from '~/components/ui/Input.vue'
import { useToast } from '~/composables/useToast'

const { t } = useI18n()
const { deleteAccount } = useAuth()
const toast = useToast()

const open = ref(false)
const confirmText = ref('')
const busy = ref(false)
const canDelete = computed(() => confirmText.value === 'DELETE')

function openModal() {
  confirmText.value = ''
  open.value = true
}
function close() {
  open.value = false
}
async function confirm() {
  if (!canDelete.value || busy.value) return
  busy.value = true
  const { error } = await deleteAccount()
  busy.value = false
  if (error) {
    toast.error(t('settings.account.danger.error'))
    open.value = false
  }
  // success navigates away via signOutAndExit — nothing else to do
}
</script>

<template>
  <section class="danger" :aria-label="t('settings.account.danger.title')">
    <h3 class="danger__title">{{ t('settings.account.danger.title') }}</h3>
    <p class="danger__desc">{{ t('settings.account.danger.description') }}</p>
    <Button class="danger__open" variant="danger" size="sm" @click="openModal">
      {{ t('settings.account.danger.button') }}
    </Button>

    <Modal
      :open="open"
      :close-label="t('settings.account.danger.cancel')"
      :title="t('settings.account.danger.modal_title')"
      @close="close"
    >
      <h2 class="danger__modal-title">{{ t('settings.account.danger.modal_title') }}</h2>
      <p class="danger__modal-body">{{ t('settings.account.danger.modal_body') }}</p>
      <Field :label="t('settings.account.danger.confirm_label')" html-for="del-confirm">
        <Input id="del-confirm" v-model="confirmText" placeholder="DELETE" />
      </Field>
      <div class="danger__actions">
        <Button variant="secondary" size="sm" @click="close">
          {{ t('settings.account.danger.cancel') }}
        </Button>
        <Button
          class="danger-confirm"
          variant="danger"
          size="sm"
          :disabled="!canDelete || busy"
          :loading="busy"
          @click="confirm"
        >
          {{ t('settings.account.danger.confirm_button') }}
        </Button>
      </div>
    </Modal>
  </section>
</template>

<style scoped>
.danger {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  border: 2px solid var(--danger);
  padding: 16px;
  margin-top: 8px;
}
.danger__title {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--danger);
  margin: 0;
}
.danger__desc {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-soft);
  margin: 0;
}
.danger__modal-title {
  font-family: 'Press Start 2P', 'Noto Sans KR', monospace;
  font-size: 13px;
  color: var(--ink);
  margin: 0 0 12px;
}
.danger__modal-body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ink);
  margin: 0 0 16px;
}
.danger__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
