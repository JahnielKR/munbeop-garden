<script setup lang="ts">
import { DRILL_CLASSES, type DrillClassId } from '~/lib/conjugation-drill'

interface Props { selected: DrillClassId }
defineProps<Props>()
defineEmits<{ select: [id: DrillClassId] }>()
</script>

<template>
  <div class="picker">
    <h2 class="picker__title">{{ $t('conjugation.pick_class') }}</h2>
    <div class="picker__chips" role="group" :aria-label="$t('conjugation.pick_class')">
      <button
        v-for="c in DRILL_CLASSES"
        :key="c.id"
        type="button"
        class="picker__chip"
        :class="{ 'picker__chip--active': selected === c.id }"
        :aria-pressed="selected === c.id"
        :data-testid="`conj-class-${c.id}`"
        lang="ko"
        @click="$emit('select', c.id)"
      >
        {{ c.ko }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.picker { display: flex; flex-direction: column; gap: 8px; }
.picker__title {
  margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.06em; color: var(--text-soft); text-transform: uppercase;
}
.picker__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.picker__chip {
  min-width: 0; padding: 8px 12px; background: var(--paper-deep); border: 2px solid var(--border);
  font-family: var(--font-ko); font-size: var(--text-sm); color: var(--text-soft); cursor: pointer;
  transition: background var(--motion-quick) var(--ease-out), color var(--motion-quick) var(--ease-out);
}
.picker__chip:hover { color: var(--text); }
.picker__chip--active { background: var(--accent); color: var(--text-on-accent); border-color: var(--ink-line); }
.picker__chip:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
</style>
