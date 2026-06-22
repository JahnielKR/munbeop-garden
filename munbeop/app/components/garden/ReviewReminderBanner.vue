<script setup lang="ts">
import { NuxtLink } from '#components'

interface Props {
  count: number
}
defineProps<Props>()
defineEmits<{ dismiss: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="reminder" data-testid="review-reminder" role="status">
    <NuxtLink class="reminder__cta" to="/practice/ruleta?revisit=due">
      🌱 {{ t('reminder.banner', { n: count }) }}
    </NuxtLink>
    <button
      type="button"
      class="reminder__dismiss"
      data-testid="reminder-dismiss"
      :aria-label="t('reminder.dismiss')"
      @click="$emit('dismiss')"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.reminder {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: var(--paper-warm);
  border: 1.5px solid var(--jade, #3f9d6b);
  border-radius: 8px;
}
.reminder__cta {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
}
.reminder__cta:hover {
  text-decoration: underline;
}
.reminder__cta:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
.reminder__dismiss {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: var(--ink-soft);
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}
.reminder__dismiss:focus-visible {
  outline: 2px solid var(--focus-ring, var(--sky));
  outline-offset: 2px;
}
</style>
