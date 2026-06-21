<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { ConjItem } from '~/lib/conjugation-drill'
import ConjugationOption from './ConjugationOption.vue'

interface Props {
  item: ConjItem
  options: string[]
  phase: 'question' | 'right' | 'wrong' | 'done'
  verdict: boolean | null
  picked: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ answer: [choice: string]; next: [] }>()

const card = ref<HTMLDivElement | null>(null)
const revealed = computed(() => props.phase === 'right' || props.phase === 'wrong')

function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (!revealed.value) return 'idle'
  if (opt === props.item.correct) return 'correct'
  if (opt === props.picked) return 'wrong'
  return 'muted'
}

// a11y (Particle Lab #10 pattern): focus the card on first mount + each new question.
onMounted(() => void card.value?.focus())
watch(
  () => [props.item.id, props.phase] as const,
  async ([, phase]) => {
    if (phase === 'question') {
      await nextTick()
      card.value?.focus()
    }
  },
)
</script>

<template>
  <div ref="card" class="card" tabindex="-1" :data-testid="`conj-card-${item.id}`">
    <div class="card__prompt">
      <span class="card__dict" lang="ko">{{ item.dict }}</span>
      <span class="card__gloss">{{ $t('conjugation.gloss_hint', { gloss: item.gloss }) }}</span>
      <span class="card__ending">{{ $t('conjugation.prompt', { ending: item.ending }) }}</span>
    </div>

    <p v-if="phase === 'question'" class="card__hint">{{ $t('conjugation.pick_hint') }}</p>

    <div class="card__options">
      <ConjugationOption
        v-for="(opt, i) in options"
        :key="opt"
        :label="opt"
        :state="optionState(opt)"
        :disabled="revealed"
        :data-testid="`conj-option-${i}`"
        @pick="emit('answer', opt)"
      />
    </div>

    <div v-if="revealed" class="card__feedback" role="status">
      <p class="card__verdict" :class="verdict ? 'card__verdict--ok' : 'card__verdict--no'">
        <span aria-hidden="true">{{ verdict ? '✅' : '✏️' }}</span>
        {{ verdict ? $t('conjugation.correct') : $t('conjugation.wrong') }}
      </p>
      <p v-if="!verdict" class="card__correct" lang="ko">
        {{ $t('conjugation.reveal_correct', { correct: item.correct }) }}
      </p>
      <p v-if="!verdict" class="card__rule">{{ $t(`conjugation.rule.${item.klass}`) }}</p>
      <button type="button" class="card__next" :aria-label="$t('conjugation.next')" @click="emit('next')"><span aria-hidden="true">→</span></button>
    </div>
  </div>
</template>

<style scoped>
.card { display: flex; flex-direction: column; gap: 16px; }
.card__prompt { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; }
.card__dict { font-family: var(--font-ko); font-weight: 700; font-size: 28px; color: var(--text); }
.card__gloss { font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__ending {
  font-family: var(--font-pixel-small); font-size: var(--text-xs);
  letter-spacing: 0.04em; color: var(--text-soft); background: var(--surface);
  border: 2px solid var(--border); padding: 4px 8px;
}
.card__hint { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.card__feedback { display: flex; flex-direction: column; gap: 8px; }
.card__verdict { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-sm); }
.card__verdict--ok { color: var(--heading-accent); }
.card__verdict--no { color: var(--danger); }
.card__correct { margin: 0; font-family: var(--font-ko); font-size: var(--text-md); color: var(--text); }
.card__rule { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); line-height: 1.6; }
.card__next {
  align-self: flex-end; padding: 10px 16px; background: var(--accent); color: var(--text-on-accent);
  border: 3px solid var(--ink-line); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.card__next:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.card__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
@media (max-width: 480px) { .card__options { grid-template-columns: 1fr; } }
</style>
