<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ count: number; goal: number }>()
const { t } = useI18n()

const R = 16
const C = 2 * Math.PI * R
const done = computed(() => props.count >= props.goal)
const ratio = computed(() => (props.goal <= 0 ? 0 : Math.min(1, props.count / props.goal)))
const dash = computed(() => `${C * ratio.value} ${C}`)
const aria = computed(() => t('garden.goal.aria', { count: props.count, goal: props.goal }))
</script>

<template>
  <div class="ring" role="img" :aria-label="aria">
    <svg class="ring__svg" viewBox="0 0 40 40" aria-hidden="true">
      <circle class="ring__track" cx="20" cy="20" :r="R" />
      <circle
        class="ring__fill"
        :class="{ 'ring__fill--done': done }"
        cx="20"
        cy="20"
        :r="R"
        :stroke-dasharray="dash"
        transform="rotate(-90 20 20)"
      />
    </svg>
    <span class="ring__label">
      {{ done ? t('garden.goal.done') : t('garden.goal.label', { count, goal }) }}
    </span>
  </div>
</template>

<style scoped>
.ring {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ring__svg {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}
.ring__track {
  fill: none;
  stroke: var(--border);
  stroke-width: 4;
}
.ring__fill {
  fill: none;
  stroke: var(--accent, var(--gold, #d4a017));
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dasharray var(--motion-slow, 400ms) var(--ease-out, ease);
}
.ring__fill--done {
  stroke: var(--jade, #3f9d6b);
}
.ring__label {
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  color: var(--text-soft);
}
@media (prefers-reduced-motion: reduce) {
  .ring__fill { transition: none; }
}
</style>
