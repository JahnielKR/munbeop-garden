<script setup lang="ts">
import { computed } from 'vue'
import type { LocalizedString } from '~/lib/domain'
import type { GapValue, SpacingPuzzle, SpacingResult } from '~/lib/particle-lab'
import { useLocalized } from '~/composables/useLocalized'
import SpacingGap from './SpacingGap.vue'
import SentenceAudioButton from './SentenceAudioButton.vue'

/** One spacing puzzle: blocks interleaved with tappable gaps + reveal feedback. */
interface Props {
  puzzle: SpacingPuzzle
  answers: GapValue[]
  phase: 'question' | 'answered' | 'done'
  result: SpacingResult | null
  trans: LocalizedString
}
const props = defineProps<Props>()
const emit = defineEmits<{ toggle: [index: number]; check: []; next: [] }>()
const { t } = useI18n()
const { tl } = useLocalized()

const revealed = computed(() => props.phase === 'answered')

/** Rebuild the correctly-spaced sentence from the puzzle alone. */
const correctText = computed(() =>
  props.puzzle.blocks
    .map((b, i) =>
      i < props.puzzle.blocks.length - 1
        ? b + (props.puzzle.gaps[i]!.correct === 'space' ? ' ' : '')
        : b,
    )
    .join(''),
)

const RULE_KEY: Record<string, string> = {
  particle: 'particles.spacing.rule_particle',
  eojeol: 'particles.spacing.rule_eojeol',
  'word-internal': 'particles.spacing.rule_word_internal',
}

/** Distinct rule messages for the gap kinds the user got wrong. */
const wrongRules = computed(() => {
  if (!props.result) return []
  const kinds = new Set<string>()
  for (const g of props.result.gaps) if (!g.correct) kinds.add(g.gap.kind)
  return [...kinds].map((k) => RULE_KEY[k]!)
})
</script>

<template>
  <section class="spacing" data-testid="spacing-card">
    <p class="spacing__lead">{{ t('particles.spacing.lead') }}</p>

    <div class="spacing__sentence" lang="ko">
      <template v-for="(block, i) in puzzle.blocks" :key="i">
        <span class="spacing__block">{{ block }}</span>
        <SpacingGap
          v-if="i < puzzle.blocks.length - 1"
          :index="i"
          :value="answers[i] ?? 'join'"
          :gap="puzzle.gaps[i]!"
          :revealed="revealed"
          @toggle="emit('toggle', $event)"
        />
      </template>
    </div>

    <p class="spacing__trans">{{ tl(trans) }}</p>

    <SentenceAudioButton :sentence-id="puzzle.sentenceId" />

    <button
      v-if="!revealed"
      type="button"
      class="spacing__btn spacing__btn--primary"
      data-testid="spacing-check"
      @click="emit('check')"
    >
      {{ t('particles.spacing.check') }}
    </button>

    <div
      v-else
      aria-live="polite"
      class="spacing__feedback"
      :class="result?.correct ? 'spacing__feedback--ok' : 'spacing__feedback--no'"
      data-testid="spacing-feedback"
    >
      <h4 class="spacing__verdict">
        {{ result?.correct ? `✅ ${t('particles.spacing.correct')}` : `✏️ ${t('particles.spacing.try_again')}` }}
      </h4>
      <p class="spacing__answer" lang="ko">{{ correctText }}</p>
      <ul v-if="wrongRules.length" class="spacing__rules">
        <li v-for="key in wrongRules" :key="key">{{ t(key) }}</li>
      </ul>
      <button
        type="button"
        class="spacing__btn"
        data-testid="spacing-next"
        @click="emit('next')"
      >
        {{ t('particles.spacing.next') }} ►
      </button>
    </div>
  </section>
</template>

<style scoped>
.spacing {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.spacing__lead {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
  line-height: 1.6;
}
.spacing__sentence {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: center;
  gap: 0;
  padding: 14px 10px;
  background: var(--surface);
  border: 2px solid var(--border);
}
.spacing__block {
  display: inline-flex;
  align-items: center;
  padding: 4px 2px;
  font-family: var(--font-ko);
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}
.spacing__trans {
  margin: 0;
  text-align: center;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
.spacing__feedback {
  border: 3px solid var(--border-strong);
  box-shadow: var(--shadow-card);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: feedback-in var(--motion-quick) var(--ease-out);
}
@keyframes feedback-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
.spacing__feedback--ok { background: var(--surface); border-color: var(--jade); }
.spacing__feedback--no { background: var(--surface); border-color: var(--danger); }
.spacing__verdict {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-sm);
  color: var(--text);
}
.spacing__answer {
  margin: 0;
  font-family: var(--font-ko);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text);
}
.spacing__rules {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text);
  line-height: 1.5;
}
.spacing__btn {
  align-self: flex-end;
  padding: 10px 16px;
  background: var(--surface);
  color: var(--text);
  border: 3px solid var(--border-strong);
  box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.spacing__btn--primary {
  align-self: center;
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: var(--ink-line);
}
.spacing__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: var(--shadow-button-hover);
}
.spacing__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
@media (max-width: 480px) {
  .spacing__block { font-size: 19px; }
}
</style>
