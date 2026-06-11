<script setup lang="ts">
import type { SelectionCandidate } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'
import HintPanel from './HintPanel.vue'

/**
 * SlotSelection — Tipo A puzzle UI (4 multiple-choice options).
 *
 * Pure presentation: receives a candidate + current hint flags, emits the
 * user's choice as `answer(index)`. Pista usage is forwarded as separate
 * events so the parent (Pinia store) is the single source of truth.
 */

interface Props {
  candidate: SelectionCandidate
  flags: { free: boolean; premium: boolean }
}

defineProps<Props>()
defineEmits<{
  answer: [optionIndex: number]
  'use-free-hint': []
  'use-premium-hint': []
}>()

const { tl } = useLocalized()
</script>

<template>
  <section class="slot-selection" data-testid="slot-selection">
    <!-- Korean line (source-of-truth, not localized) -->
    <p class="slot-selection__korean" data-testid="slot-korean">
      {{ candidate.korean }}
    </p>

    <!-- Question -->
    <h3 class="slot-selection__question" data-testid="slot-question">
      {{ tl(candidate.question) }}
    </h3>

    <!-- Options -->
    <div class="slot-selection__options">
      <button
        v-for="(opt, idx) in candidate.options"
        :key="idx"
        type="button"
        class="slot-selection__option"
        data-testid="slot-option"
        @click="$emit('answer', idx)"
      >
        <span class="slot-selection__option-label">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
        <span>{{ tl(opt) }}</span>
      </button>
    </div>

    <!-- Hints -->
    <HintPanel
      :hints="candidate.hints"
      :flags="flags"
      @use-free="$emit('use-free-hint')"
      @use-premium="$emit('use-premium-hint')"
    />
  </section>
</template>

<style scoped>
.slot-selection {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  max-width: 560px;
  margin: 0 auto;
  background: var(--surface, #fff7eb);
  border: 3px solid var(--border-strong, #6b5b4a);
}
.slot-selection__korean {
  font-family: 'Noto Sans KR', system-ui, sans-serif;
  font-size: 20px;
  line-height: 1.4;
  margin: 0;
  padding: 12px;
  background: var(--surface-elevated, #ffe8b4);
  border-left: 4px solid var(--accent, #c97c5d);
  text-align: center;
}
.slot-selection__question {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.slot-selection__options {
  display: grid;
  gap: 8px;
}
.slot-selection__option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  font: inherit;
  font-size: 13px;
  text-align: left;
  background: transparent;
  border: 2px solid var(--border-strong, #6b5b4a);
  cursor: pointer;
  min-height: 44px;
  transition: background-color 120ms, transform 120ms;
}
.slot-selection__option:hover {
  background: var(--surface-hover, #f5e9cf);
  transform: translate(-1px, -1px);
}
.slot-selection__option:active {
  transform: translate(1px, 1px);
}
.slot-selection__option-label {
  font-weight: 700;
  width: 20px;
  flex-shrink: 0;
}
</style>
