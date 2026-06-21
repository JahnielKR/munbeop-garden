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
const { t } = useI18n()

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
    :aria-label="isSpace ? t('particles.spacing.gap_space') : t('particles.spacing.gap_join')"
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
  min-width: 28px;
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
  min-width: 28px;
  background: var(--paper);
  border-bottom-color: var(--accent);
  /* The brand cue lives in the gold underline; the mark itself stays ink so
   * it clears contrast on the cream gap fill (gold-on-cream was ~1.9:1). */
  color: var(--text);
}
.gap:hover:not(:disabled) {
  color: var(--text);
}
.gap--revealed {
  cursor: default;
}
.gap--correct {
  border-bottom-color: var(--jade);
  /* Status reads from the colored underline; the glyph stays ink so the
   * small ␣/· mark is legible in light theme (jade-on-tan was ~2.5:1). */
  color: var(--text);
}
.gap--wrong {
  border-bottom-color: var(--danger);
  color: var(--text);
}
.gap:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
