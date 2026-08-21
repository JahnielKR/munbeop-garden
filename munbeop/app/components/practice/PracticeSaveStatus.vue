<script setup lang="ts">
import type { PracticeSaveStatus } from '~/lib/practice/persistence'

defineProps<{ status: PracticeSaveStatus }>()
defineEmits<{ retry: [] }>()
const { t } = useI18n()
</script>

<template>
  <div
    v-if="status !== 'idle'"
    class="save-status"
    :class="`save-status--${status}`"
    role="status"
    aria-live="polite"
    data-testid="practice-save-status"
  >
    <p class="save-status__message">
      {{
        status === 'saving'
          ? t('practice.save_saving')
          : status === 'saved'
            ? t('practice.save_saved')
            : t('practice.save_error')
      }}
    </p>
    <button
      v-if="status === 'error'"
      type="button"
      class="save-status__retry"
      data-testid="practice-save-retry"
      @click="$emit('retry')"
    >
      {{ t('practice.save_retry') }}
    </button>
  </div>
</template>

<style scoped>
.save-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 2px solid var(--border);
  background: var(--surface);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
}
.save-status--saved { border-color: var(--jade); }
.save-status--error { border-color: var(--danger); }
.save-status__message { margin: 0; line-height: 1.5; }
.save-status__retry {
  flex: 0 0 auto;
  padding: 8px 12px;
  border: 2px solid var(--ink-line);
  background: var(--accent);
  color: var(--text-on-accent);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  cursor: pointer;
}
.save-status__retry:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
