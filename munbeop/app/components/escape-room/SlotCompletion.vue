<script setup lang="ts">
import { ref } from 'vue'
import type { CompletionCandidate } from '~/lib/domain'
import { useLocalized } from '~/composables/useLocalized'
import HintPanel from './HintPanel.vue'

/**
 * SlotCompletion — Tipo B puzzle UI (fill the blank).
 *
 * Shows the Korean line with its `___` gap and the target translation;
 * the player types the missing piece (particle, conjugation…). Emits the
 * trimmed text; correctness is judged by the store.
 */

interface Props {
  candidate: CompletionCandidate
  flags: { free: boolean; premium: boolean }
}

defineProps<Props>()
const emit = defineEmits<{
  answer: [text: string]
  'use-free-hint': []
  'use-premium-hint': []
}>()

const { tl } = useLocalized()
const { t } = useI18n()

const input = ref('')

function submit() {
  const text = input.value.trim()
  if (!text) return
  emit('answer', text)
}
</script>

<template>
  <section class="slot-completion" data-testid="slot-completion">
    <p class="slot-completion__korean" data-testid="slot-korean">
      {{ candidate.korean }}
    </p>
    <p class="slot-completion__translation" data-testid="slot-translation">
      {{ tl(candidate.translation) }}
    </p>

    <div class="slot-completion__row">
      <input
        v-model="input"
        type="text"
        class="slot-completion__input"
        data-testid="slot-input"
        :placeholder="t('escape.completion_placeholder')"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        lang="ko"
        @keydown.enter="submit"
      >
      <button
        type="button"
        class="slot-completion__check"
        data-testid="slot-check"
        @click="submit"
      >
        {{ t('escape.check') }}
      </button>
    </div>

    <HintPanel
      :hints="candidate.hints"
      :flags="flags"
      @use-free="$emit('use-free-hint')"
      @use-premium="$emit('use-premium-hint')"
    />
  </section>
</template>

<style scoped>
.slot-completion {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  max-width: 560px;
  margin: 0 auto;
  background: var(--surface, #fff7eb);
  border: 3px solid var(--border-strong, #6b5b4a);
}
.slot-completion__korean {
  font-family: 'Noto Sans KR', system-ui, sans-serif;
  font-size: 22px;
  line-height: 1.5;
  margin: 0;
  padding: 12px;
  background: var(--surface-elevated, #ffe8b4);
  border-left: 4px solid var(--accent, #c97c5d);
  text-align: center;
  letter-spacing: 0.02em;
}
.slot-completion__translation {
  margin: 0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-style: italic;
  color: var(--text-muted, #8a6f4a);
  text-align: center;
}
.slot-completion__row {
  display: flex;
  gap: 8px;
}
.slot-completion__input {
  flex: 1;
  font-family: 'Noto Sans KR', system-ui, sans-serif;
  font-size: 18px;
  padding: 10px 14px;
  border: 2px solid var(--border-strong, #6b5b4a);
  background: var(--surface-elevated);
  color: var(--text);
  min-height: 44px;
}
.slot-completion__input:focus-visible {
  outline: 2px solid var(--focus-ring, #d8842f);
  outline-offset: 1px;
}
.slot-completion__check {
  font-family: 'Press Start 2P', 'Noto Sans KR', system-ui, monospace;
  font-size: 10px;
  padding: 10px 18px;
  border: 2px solid var(--border-strong, #6b5b4a);
  background: var(--accent, #c97c5d);
  color: var(--text-on-accent, #fff7eb);
  cursor: pointer;
  min-height: 44px;
}
.slot-completion__check:hover {
  filter: brightness(1.06);
}
</style>
