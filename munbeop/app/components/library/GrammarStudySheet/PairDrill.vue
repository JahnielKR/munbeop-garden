<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ConfusablePair } from '~/lib/domain'

interface Props {
  pair: ConfusablePair
}
const props = defineProps<Props>()
const { t } = useI18n()
const { tl } = useLocalized()

const index = ref(0)
const picked = ref<'a' | 'b' | null>(null)
const correctCount = ref(0)
const done = ref(false)

const item = computed(() => props.pair.items[index.value]!)
const total = computed(() => props.pair.items.length)
const revealed = computed(() => picked.value !== null)
const isCorrect = computed(() => picked.value === item.value.answer)
const parts = computed(() => item.value.sentence.split('{}'))
const filled = computed(() =>
  revealed.value ? (item.value.answer === 'a' ? item.value.optionA : item.value.optionB) : null,
)

function optionState(side: 'a' | 'b'): 'idle' | 'correct' | 'wrong' | 'muted' {
  if (!revealed.value) return 'idle'
  if (side === item.value.answer) return 'correct'
  if (side === picked.value) return 'wrong'
  return 'muted'
}
function pick(side: 'a' | 'b') {
  if (revealed.value) return
  picked.value = side
  if (side === item.value.answer) correctCount.value += 1
}
function next() {
  if (index.value + 1 >= total.value) {
    done.value = true
    return
  }
  index.value += 1
  picked.value = null
}
function restart() {
  index.value = 0
  picked.value = null
  correctCount.value = 0
  done.value = false
}
</script>

<template>
  <div class="pair-drill" data-testid="pair-drill">
    <template v-if="!done">
      <p class="pair-drill__sentence" lang="ko">
        <span>{{ parts[0] }}</span>
        <span class="pair-drill__blank" :class="{ 'pair-drill__blank--filled': revealed }">{{ filled ?? '____' }}</span>
        <span>{{ parts[1] }}</span>
      </p>
      <div class="pair-drill__options">
        <button
          type="button"
          class="pair-drill__opt"
          :class="`pair-drill__opt--${optionState('a')}`"
          :disabled="revealed"
          lang="ko"
          data-testid="pair-opt-a"
          @click="pick('a')"
        >
          {{ item.optionA }}
        </button>
        <button
          type="button"
          class="pair-drill__opt"
          :class="`pair-drill__opt--${optionState('b')}`"
          :disabled="revealed"
          lang="ko"
          data-testid="pair-opt-b"
          @click="pick('b')"
        >
          {{ item.optionB }}
        </button>
      </div>
      <div v-if="revealed" class="pair-drill__feedback" role="status">
        <p class="pair-drill__verdict" :class="isCorrect ? 'is-ok' : 'is-no'">
          {{ isCorrect ? t('library.confused.correct') : t('library.confused.wrong') }}
        </p>
        <p class="pair-drill__why">{{ tl(item.why) }}</p>
        <p class="pair-drill__trans">{{ tl(item.trans) }}</p>
        <button type="button" class="pair-drill__btn" data-testid="pair-next" @click="next">
          {{ t('library.confused.next') }}
        </button>
      </div>
    </template>
    <div v-else class="pair-drill__score" role="status">
      <p class="pair-drill__score-text">{{ t('library.confused.score', { correct: correctCount, total }) }}</p>
      <button type="button" class="pair-drill__btn" data-testid="pair-restart" @click="restart">
        {{ t('library.confused.restart') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.pair-drill {
  margin-top: 8px;
  padding: 10px;
  background: var(--paper);
  border: 2px solid var(--ink-line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pair-drill__sentence {
  margin: 0;
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 15px;
  color: var(--ink);
  line-height: 1.6;
}
.pair-drill__blank {
  border-bottom: 2px solid var(--ink-line);
  padding: 0 8px;
  margin: 0 2px;
  font-weight: 700;
}
.pair-drill__blank--filled {
  border-bottom-color: var(--ink);
}
.pair-drill__options {
  display: flex;
  gap: 8px;
}
.pair-drill__opt {
  flex: 1;
  min-height: 44px;
  padding: 8px 12px;
  background: var(--paper-deep);
  border: 2px solid var(--ink-line);
  color: var(--ink);
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 16px;
  cursor: pointer;
}
.pair-drill__opt:hover:not(:disabled) {
  border-color: var(--ink);
}
.pair-drill__opt:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.pair-drill__opt--correct {
  border-color: var(--jade);
  background: var(--surface);
}
.pair-drill__opt--wrong {
  border-color: var(--danger);
  background: var(--surface);
}
.pair-drill__opt--muted {
  opacity: 0.55;
}
.pair-drill__feedback {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pair-drill__verdict {
  margin: 0;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
}
.pair-drill__verdict.is-ok {
  color: var(--heading-accent);
}
.pair-drill__verdict.is-no {
  color: var(--danger);
}
.pair-drill__why {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink);
  line-height: 1.5;
}
.pair-drill__trans {
  margin: 0;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
}
.pair-drill__btn {
  align-self: flex-start;
  padding: 6px 14px;
  background: var(--accent);
  color: var(--text-on-accent);
  border: 2px solid var(--ink-line);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  cursor: pointer;
}
.pair-drill__btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.pair-drill__score-text {
  margin: 0 0 8px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--ink);
}
</style>
