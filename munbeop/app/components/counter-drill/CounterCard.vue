<script setup lang="ts">
import type { CountItem } from '~/lib/domain'

interface Props {
  item: CountItem
  options: string[]
  phase: 'question' | 'right' | 'wrong' | 'done'
  picked: string | null
  verdict: boolean | null
}
const props = defineProps<Props>()
defineEmits<{ answer: [choice: string]; next: [] }>()
const { t } = useI18n()
const { tl } = useLocalized()

function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (props.phase === 'question') return 'idle'
  if (opt === props.item.answer) return 'correct'
  if (opt === props.picked) return 'wrong'
  return 'muted'
}
</script>

<template>
  <div class="counter-card" data-testid="counter-card">
    <p class="counter-card__prompt" lang="ko">
      <span class="counter-card__noun">{{ item.noun }}</span>
      <span class="counter-card__times">× {{ item.quantity }}</span>
    </p>
    <div class="counter-card__options">
      <button
        v-for="opt in options"
        :key="opt"
        type="button"
        class="counter-card__opt"
        :class="`counter-card__opt--${optionState(opt)}`"
        :disabled="phase !== 'question'"
        lang="ko"
        data-testid="counter-option"
        @click="$emit('answer', opt)"
      >
        {{ opt }}
      </button>
    </div>
    <div v-if="phase === 'right' || phase === 'wrong'" class="counter-card__feedback" role="status">
      <p class="counter-card__verdict" :class="verdict ? 'is-ok' : 'is-no'">
        {{ verdict ? t('counters.correct') : t('counters.wrong') }}
      </p>
      <p class="counter-card__why" lang="ko">{{ item.answer }} · {{ tl(item.trans) }}</p>
      <button type="button" class="counter-card__btn" data-testid="counter-next" @click="$emit('next')">
        {{ t('counters.next') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.counter-card { display: flex; flex-direction: column; gap: 12px; padding: 14px; background: var(--paper); border: 2px solid var(--ink-line); }
.counter-card__prompt { margin: 0; font-family: 'Noto Sans KR', sans-serif; font-size: 20px; color: var(--ink); display: flex; gap: 10px; align-items: baseline; }
.counter-card__times { font-family: 'JetBrains Mono', monospace; color: var(--ink-soft); }
.counter-card__options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.counter-card__opt { min-height: 48px; padding: 8px 12px; background: var(--paper-deep); border: 2px solid var(--ink-line); color: var(--ink); font-family: 'Noto Sans KR', sans-serif; font-size: 17px; cursor: pointer; }
.counter-card__opt:hover:not(:disabled) { border-color: var(--ink); }
.counter-card__opt:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.counter-card__opt--correct { border-color: var(--jade); background: var(--surface); }
.counter-card__opt--wrong { border-color: var(--danger); background: var(--surface); }
.counter-card__opt--muted { opacity: 0.55; }
.counter-card__feedback { display: flex; flex-direction: column; gap: 4px; }
.counter-card__verdict { margin: 0; font-family: 'Press Start 2P', monospace; font-size: 10px; }
.counter-card__verdict.is-ok { color: var(--heading-accent); }
.counter-card__verdict.is-no { color: var(--danger); }
.counter-card__why { margin: 0; font-family: 'Noto Sans KR', sans-serif; font-size: 14px; color: var(--ink); }
.counter-card__btn { align-self: flex-start; padding: 6px 14px; background: var(--accent); color: var(--text-on-accent); border: 2px solid var(--ink-line); font-family: 'Press Start 2P', monospace; font-size: 9px; cursor: pointer; }
@media (max-width: 480px) { .counter-card__options { grid-template-columns: 1fr; } }
</style>
