<script setup lang="ts">
import Button from '~/components/ui/Button.vue'
import { useAppStatus } from '~/stores/appStatus'

const appStatus = useAppStatus()
const { t } = useI18n()
</script>

<template>
  <div
    v-if="appStatus.status === 'error'"
    class="banner"
    role="alert"
    aria-live="assertive"
    data-test="data-error"
  >
    <span class="banner__msg">{{ t('errors.data_failed') }}</span>
    <Button
      class="banner__retry"
      variant="danger"
      size="sm"
      data-test="data-retry"
      @click="appStatus.retry()"
    >
      {{ t('errors.retry') }}
    </Button>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 14px;
  margin-bottom: 16px;
  background: var(--surface);
  border: 2px solid var(--danger);
  box-shadow: var(--bevel), var(--shadow-pixel-md);
}
.banner__msg {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--danger);
}
.banner__retry {
  flex-shrink: 0;
}
</style>
