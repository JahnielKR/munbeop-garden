<script setup lang="ts">
import type { SpacingLevel } from '~/lib/particle-lab'

/** Two-button segmented control: 초급 (1) / 고급 (2). */
interface Props {
  level: SpacingLevel
}
defineProps<Props>()
const emit = defineEmits<{ select: [level: SpacingLevel] }>()
const { t } = useI18n()

const LEVELS: { value: SpacingLevel; ko: string; aria: string }[] = [
  { value: 1, ko: '초급', aria: 'particles.spacing.level_beginner' },
  { value: 2, ko: '고급', aria: 'particles.spacing.level_advanced' },
]
</script>

<template>
  <div class="level-picker">
    <h3 class="level-picker__title">{{ t('particles.spacing.level_label') }}</h3>
    <div class="level-picker__row" role="group" :aria-label="t('particles.spacing.level_label')">
      <button
        v-for="lv in LEVELS"
        :key="lv.value"
        type="button"
        class="level-picker__btn"
        :class="{ 'level-picker__btn--active': lv.value === level }"
        :aria-pressed="lv.value === level"
        :aria-label="t(lv.aria)"
        :data-testid="`spacing-level-${lv.value}`"
        @click="emit('select', lv.value)"
      >
        <span lang="ko">{{ lv.ko }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.level-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.level-picker__title {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}
.level-picker__row {
  display: flex;
  gap: 8px;
}
.level-picker__btn {
  padding: 8px 16px;
  background: var(--surface);
  border: 2px solid var(--border);
  font-family: var(--font-ko);
  font-size: var(--text-sm);
  color: var(--text-soft);
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.level-picker__btn:hover {
  transform: translate(-1px, -1px);
  color: var(--text);
}
.level-picker__btn--active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--ink-line);
}
.level-picker__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
