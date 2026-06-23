<!-- app/components/placement/PlacementCard.vue -->
<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { PlacementItem } from '~/lib/domain'
import PlacementOption from './PlacementOption.vue'

interface Props {
  item: PlacementItem
  options: string[]
  phase: 'question' | 'right' | 'wrong' | 'done'
  verdict: boolean | null
  picked: string | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ answer: [choice: string]; next: [] }>()
const { tl } = useLocalized()

const card = ref<HTMLDivElement | null>(null)
const revealed = computed(() => props.phase === 'right' || props.phase === 'wrong')
const parts = computed(() => props.item.sentence.split('{}'))
const filled = computed(() => (revealed.value ? props.item.answer : null))

function optionState(opt: string): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (!revealed.value) return 'idle'
  if (opt === props.item.answer) return 'correct'
  if (opt === props.picked) return 'wrong'
  return 'muted'
}

onMounted(() => void card.value?.focus())
watch(
  () => [props.item.ko, props.item.sentence, props.phase] as const,
  async ([, , phase]) => {
    if (phase === 'question') {
      await nextTick()
      card.value?.focus()
    }
  },
)
</script>

<template>
  <div ref="card" class="card" tabindex="-1" data-testid="placement-card">
    <p class="card__sentence" lang="ko">
      <span>{{ parts[0] }}</span>
      <span class="card__blank" :class="{ 'card__blank--filled': revealed }">{{ filled ?? '____' }}</span>
      <span>{{ parts[1] }}</span>
    </p>

    <p v-if="phase === 'question'" class="card__hint">{{ $t('placement.pick_hint') }}</p>

    <div class="card__options">
      <PlacementOption
        v-for="(opt, i) in options"
        :key="opt"
        :label="opt"
        :state="optionState(opt)"
        :disabled="revealed"
        :data-testid="`placement-option-${i}`"
        @pick="emit('answer', opt)"
      />
    </div>

    <div v-if="revealed" class="card__feedback" role="status">
      <p class="card__verdict" :class="verdict ? 'card__verdict--ok' : 'card__verdict--no'">
        <span aria-hidden="true">{{ verdict ? '✅' : '✏️' }}</span>
        {{ verdict ? $t('placement.correct') : $t('placement.wrong') }}
      </p>
      <p v-if="!verdict" class="card__correct" lang="ko">{{ $t('placement.reveal_correct', { correct: item.answer }) }}</p>
      <p class="card__why">{{ tl(item.why) }}</p>
      <p class="card__trans">{{ tl(item.trans) }}</p>
      <button type="button" class="card__next" :aria-label="$t('placement.next')" @click="emit('next')">
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Copied verbatim from app/components/cloze-drill/ClozeCard.vue */
.card { display: flex; flex-direction: column; gap: 16px; }
.card__sentence { margin: 0; font-family: var(--font-ko); font-size: 20px; line-height: 1.7; color: var(--text); }
.card__blank { border-bottom: 2px solid var(--border); padding: 0 10px; margin: 0 2px; font-weight: 700; }
.card__blank--filled { border-bottom-color: var(--heading-accent); color: var(--heading-accent); }
.card__hint { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.card__feedback { display: flex; flex-direction: column; gap: 8px; }
.card__verdict { margin: 0; font-family: var(--font-pixel-small); font-size: var(--text-sm); }
.card__verdict--ok { color: var(--heading-accent); }
.card__verdict--no { color: var(--danger); }
.card__correct { margin: 0; font-family: var(--font-ko); font-size: var(--text-md); color: var(--text); }
.card__why { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text); line-height: 1.6; }
.card__trans { margin: 0; font-family: var(--font-ui); font-size: var(--text-sm); color: var(--text-soft); }
.card__next {
  align-self: flex-end; padding: 10px 16px; background: var(--accent); color: var(--text-on-accent);
  border: 3px solid var(--ink-line); box-shadow: var(--shadow-button);
  font-family: var(--font-pixel-small); font-size: var(--text-xs); letter-spacing: 0.06em; cursor: pointer;
}
.card__next:hover { transform: translate(-1px, -1px); box-shadow: var(--shadow-button-hover); }
.card__next:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
@media (max-width: 480px) { .card__options { grid-template-columns: 1fr; } }
</style>
