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
      <svg
        class="reminder__seed"
        viewBox="0 0 16 16"
        aria-hidden="true"
        shape-rendering="crispEdges"
      >
        <path d="M7 6h2v9H7zM1 2h5v1h2v5H5V7H3V5H1zM10 1h5v4h-1v2h-5V3h1z" />
      </svg>
      <span>{{ t('reminder.banner', { n: count }) }}</span>
    </NuxtLink>
    <button
      type="button"
      class="reminder__dismiss"
      data-testid="reminder-dismiss"
      :aria-label="t('reminder.dismiss')"
      @click="$emit('dismiss')"
    >
      <span class="reminder__dismiss-mark" aria-hidden="true" />
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
  padding: 12px 14px;
  background: var(--surface);
  border: 2px solid var(--jade);
  box-shadow: var(--bevel), var(--shadow-pixel-md);
}
.reminder__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  line-height: 1.6;
  color: var(--text);
  text-decoration: none;
}
.reminder__seed {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  fill: var(--jade);
}
.reminder__cta:hover {
  color: var(--link);
  text-decoration: underline 2px;
  text-underline-offset: 3px;
}
.reminder__cta:active {
  transform: translateY(2px);
}
.reminder__cta:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.reminder__dismiss {
  position: relative;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  padding: 0;
  background: var(--surface-elevated);
  border: 2px solid var(--border-strong);
  box-shadow: var(--shadow-pixel-sm);
  color: var(--text);
  cursor: pointer;
  transform: translate(0, 0);
  transition:
    background-color var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out),
    transform var(--motion-quick) var(--ease-out);
}
.reminder__dismiss:hover {
  background: var(--surface-hover);
  transform: translate(-1px, -1px);
}
.reminder__dismiss:active {
  box-shadow: none;
  transform: translate(2px, 2px);
}
.reminder__dismiss-mark::before,
.reminder__dismiss-mark::after {
  position: absolute;
  top: 12px;
  left: 6px;
  width: 14px;
  height: 2px;
  content: '';
  background: currentColor;
}
.reminder__dismiss-mark::before {
  transform: rotate(45deg);
}
.reminder__dismiss-mark::after {
  transform: rotate(-45deg);
}
.reminder__dismiss:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
