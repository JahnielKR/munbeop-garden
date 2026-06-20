<script setup lang="ts">
import { computed } from 'vue'
import type { ClashSet, DrillItem, DrillVerdict } from '~/lib/domain'
import { correctSentence, optionsFor, sentenceParts } from '~/lib/particle-lab'
import { useLocalized } from '~/composables/useLocalized'
import DrillOption from './DrillOption.vue'

/** One drill question: cue, gap sentence, 2–4 options, phase feedback. */
interface Props {
  item: DrillItem
  set: ClashSet
  phase: 'question' | 'blocked' | 'right' | 'wrong'
  verdict: DrillVerdict | null
  picked: string | null
  blockedChoices: ReadonlySet<string>
}
const props = defineProps<Props>()
const emit = defineEmits<{ answer: [choice: string]; retry: []; next: [] }>()
const { t } = useI18n()
const { tl } = useLocalized()

const revealed = computed(() => props.phase === 'right' || props.phase === 'wrong')
const parts = computed(() => sentenceParts(props.item, props.set))
const answer = computed(() => parts.value.answer)
const options = computed(() => optionsFor(props.item, props.set))

function stateOf(choice: string): 'idle' | 'blocked' | 'correct' | 'wrong' {
  if (props.blockedChoices.has(choice)) return 'blocked'
  if (revealed.value && choice === answer.value) return 'correct'
  if (props.phase === 'wrong' && choice === props.picked) return 'wrong'
  return 'idle'
}
</script>

<template>
  <section
    class="drill"
    :class="{ 'drill--shake': phase === 'blocked' }"
    data-testid="drill-card"
  >
    <div class="drill__cue">
      <span class="drill__cue-label">{{ t('particles.drill.cue_label') }}</span>
      <p class="drill__cue-text">💬 {{ tl(item.cue) }}</p>
    </div>

    <p class="drill__sentence" lang="ko">
      <span v-if="parts.before">{{ parts.before }}</span
      ><span class="drill__gap" :class="{ 'drill__gap--filled': revealed }">{{
        revealed ? parts.answer : '?'
      }}</span
      ><span>{{ parts.after }}</span>
    </p>

    <div class="drill__options" role="group" :aria-label="t('particles.drill.options_label')">
      <DrillOption
        v-for="c in options"
        :key="c"
        :choice="c"
        :state="stateOf(c)"
        :disabled="phase !== 'question'"
        @pick="emit('answer', c)"
      />
    </div>

    <div aria-live="polite">
      <div
        v-if="phase === 'blocked' && verdict?.kind === 'blocked'"
        class="feedback feedback--blocked"
        data-testid="drill-blocked"
      >
        <h4 class="feedback__title">🧱 {{ t('particles.drill.blocked_title') }}</h4>
        <p class="feedback__body">
          {{
            t(
              verdict.nounHasBatchim
                ? 'particles.drill.blocked_consonant'
                : 'particles.drill.blocked_vowel',
              { noun: item.noun, expected: verdict.expected },
            )
          }}
        </p>
        <button type="button" class="feedback__btn" @click="emit('retry')">
          {{ t('particles.drill.retry') }}
        </button>
      </div>

      <div
        v-else-if="phase === 'blocked' && verdict?.kind === 'contraction'"
        class="feedback feedback--blocked"
        data-testid="drill-contraction"
      >
        <h4 class="feedback__title">🔗 {{ t('particles.drill.contraction_title') }}</h4>
        <p class="feedback__body">
          {{
            t('particles.drill.contraction_rule', {
              pronoun: item.noun,
              answer: verdict.expected,
              trap: item.noun + '가',
            })
          }}
        </p>
        <button type="button" class="feedback__btn" @click="emit('retry')">
          {{ t('particles.drill.retry') }}
        </button>
      </div>

      <div
        v-else-if="revealed"
        class="feedback"
        :class="phase === 'right' ? 'feedback--right' : 'feedback--wrong'"
        data-testid="drill-feedback"
      >
        <h4 class="feedback__title">
          {{ phase === 'right' ? `✅ ${t('particles.drill.right_title')}` : `❌ ${t('particles.drill.wrong_title')}` }}
        </h4>
        <p class="feedback__sentence" lang="ko">{{ correctSentence(item, set) }}</p>
        <p class="feedback__trans">{{ tl(item.trans) }}</p>
        <p class="feedback__body">{{ tl(item.reason) }}</p>
        <p v-if="phase === 'wrong'" class="feedback__diary">
          📓 {{ t('particles.drill.saved_to_diary') }}
        </p>
        <button type="button" class="feedback__btn" @click="emit('next')">
          {{ t('particles.drill.next') }} ►
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.drill {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.drill--shake {
  animation: drill-shake var(--motion-base) steps(3) 2;
}
@keyframes drill-shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
  100% { transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .drill--shake { animation: none; }
}

.drill__cue {
  background: var(--paper);
  border-left: 4px solid var(--sky);
  padding: 10px 12px;
}
.drill__cue-label {
  display: block;
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  color: var(--text-soft);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.drill__cue-text {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text);
  line-height: 1.6;
}

.drill__sentence {
  margin: 0;
  text-align: center;
  font-family: var(--font-ko);
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.6;
}
.drill__gap {
  display: inline-block;
  min-width: 34px;
  margin: 0 2px;
  padding: 0 6px;
  border: 2px dashed var(--gold);
  color: var(--text-soft);
  text-align: center;
}
.drill__gap--filled {
  border-style: solid;
  background: var(--gold);
  color: var(--always-dark);
}

.drill__options {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.feedback {
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
.feedback--blocked { background: var(--surface); border-color: var(--gold); }
.feedback--right { background: var(--surface); border-color: var(--jade); }
.feedback--wrong { background: var(--surface); border-color: var(--danger); }
.feedback__title {
  margin: 0;
  font-family: var(--font-pixel-small);
  font-size: var(--text-sm);
  color: var(--text);
}
.feedback__sentence {
  margin: 0;
  font-family: var(--font-ko);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text);
}
.feedback__trans {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text-soft);
}
.feedback__body {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text);
  line-height: 1.6;
}
.feedback__diary {
  margin: 0;
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-soft);
}
.feedback__btn {
  align-self: flex-end;
  padding: 10px 16px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 3px solid var(--ink-line);
  box-shadow: 3px 3px 0 var(--shadow-cream);
  font-family: var(--font-pixel-small);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    transform var(--motion-quick) var(--ease-out),
    box-shadow var(--motion-quick) var(--ease-out);
}
.feedback__btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--shadow-cream);
}
.feedback__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

@media (max-width: 480px) {
  .drill__sentence { font-size: 19px; }
  .drill__options { gap: 8px; }
}
</style>
