<script setup lang="ts">
import type { ClashSet } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'

/** Chip row to choose which clash set the drill runs. */
interface Props {
  sets: ClashSet[]
  selected: string
}
defineProps<Props>()
const emit = defineEmits<{ select: [id: string] }>()
const { t } = useI18n()
const { tl } = useLocalized()
</script>

<template>
  <div class="set-picker">
    <h3 class="set-picker__title">{{ t('particles.drill.set_picker_label') }}</h3>
    <div class="set-picker__chips" role="group" :aria-label="t('particles.drill.set_picker_label')">
      <button
        v-for="s in sets"
        :key="s.id"
        type="button"
        class="set-picker__chip"
        :class="{ 'set-picker__chip--active': s.id === selected }"
        :aria-pressed="s.id === selected"
        data-testid="set-chip"
        @click="emit('select', s.id)"
      >
        <span lang="ko">{{ tl(s.name) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.set-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.set-picker__title {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
}
.set-picker__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.set-picker__chip {
  padding: 8px 12px;
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
.set-picker__chip:hover {
  transform: translate(-1px, -1px);
  color: var(--text);
}
.set-picker__chip--active {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--ink-line);
}
.set-picker__chip:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
