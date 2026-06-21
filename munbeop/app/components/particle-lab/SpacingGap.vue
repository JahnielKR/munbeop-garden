<script setup lang="ts">
import { computed } from 'vue'
import type { Gap, GapValue } from '~/lib/particle-lab'

/** One tappable junction between two blocks: space (␣) or join (·). */
interface Props {
  index: number
  value: GapValue
  gap: Gap
  revealed: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{ toggle: [index: number] }>()

const isSpace = computed(() => props.value === 'space')
const isCorrect = computed(() => props.value === props.gap.correct)
</script>

<template>
  <button
    type="button"
    class="gap"
    :class="{
      'gap--space': isSpace,
      'gap--revealed': revealed,
      'gap--correct': revealed && isCorrect,
      'gap--wrong': revealed && !isCorrect,
    }"
    :disabled="revealed"
    :aria-pressed="isSpace"
    :data-testid="`spacing-gap-${index}`"
    @click="emit('toggle', index)"
  >
    <span class="gap__mark" aria-hidden="true">{{ isSpace ? '␣' : '·' }}</span>
  </button>
</template>

<style scoped>
.gap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  align-self: stretch;
  margin: 0 1px;
  padding: 0 2px;
  background: transparent;
  border: none;
  border-bottom: 2px dotted var(--border);
  color: var(--text-soft);
  font-family: var(--font-ko);
  font-size: var(--text-md);
  cursor: pointer;
  transition:
    background var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.gap--space {
  min-width: 22px;
  background: var(--paper);
  border-bottom-color: var(--accent);
  color: var(--accent);
}
.gap:hover:not(:disabled) {
  color: var(--text);
}
.gap--revealed {
  cursor: default;
}
.gap--correct {
  border-bottom-color: var(--jade);
  color: var(--jade);
}
.gap--wrong {
  border-bottom-color: var(--danger);
  color: var(--danger);
}
.gap:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
