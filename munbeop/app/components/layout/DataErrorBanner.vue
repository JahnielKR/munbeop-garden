<script setup lang="ts">
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
    <button type="button" class="banner__retry" data-test="data-retry" @click="appStatus.retry()">
      {{ t('errors.retry') }}
    </button>
  </div>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background: var(--paper-warm);
  border: 1.5px solid var(--danger, #c0392b);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
}
.banner__msg {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--danger, #c0392b);
}
.banner__retry {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--danger, #c0392b);
  border-radius: 999px;
  padding: 4px 14px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--motion-quick, 120ms) ease;
}
.banner__retry:hover {
  background: var(--paper-deep);
}
.banner__retry:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>
