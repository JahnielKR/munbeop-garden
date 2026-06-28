<script setup lang="ts">
import type { Context, ErrorDimension, Grammar } from '~/lib/domain'
import { getMasteryInfo } from '~/lib/srs'
import { useSrsStore } from '~/stores/srs'
import Badge from '~/components/ui/Badge.vue'
import Card from '~/components/ui/Card.vue'
import ContextDisplay from './ContextDisplay.vue'
import ProgressDots from './ProgressDots.vue'
import SentenceInput from './SentenceInput.vue'
import FeedbackRow from './FeedbackRow.vue'
import ErrorNoteBlock from './ErrorNoteBlock.vue'
import MasteryIcon from './MasteryIcon.vue'

interface Props {
  grammar: Grammar
  context: Context
  progress: number
  pickIndex: number
  /** True while the parent is awaiting this card's save (cloud write in flight).
   * Disables the actions so a double-tap can't double-log the same answer. */
  submitting?: boolean
}
const props = defineProps<Props>()

type SubmitPayload = {
  pickIndex: number
  sentence: string
  feedback: 'easy' | 'hard'
  errorNote: string | null
  errorDimension: ErrorDimension | null
}
const emit = defineEmits<{ submit: [SubmitPayload] }>()

const srs = useSrsStore()
const { t } = useI18n()
const { tl } = useLocalized()
const masteryLevel = computed(() => srs.peek(props.grammar.ko).mastery)
const masteryInfo = computed(() => getMasteryInfo(masteryLevel.value))

const sentence = ref('')
const showErrorBlock = ref(false)
const errorNote = ref('')
const errorDimension = ref<ErrorDimension | null>(null)
// The example is a crutch: hidden until the learner asks for it, so they try
// producing the sentence from the grammar+meaning first. Lives outside reset()
// on purpose — it's per-grammar (this card spans 3 contexts), so once revealed
// it stays revealed for the remaining contexts of the same card; the next card
// is a fresh instance and starts hidden again.
const showExample = ref(false)

// Local one-shot latch, closed synchronously on submit so a fast double-tap
// can't fire twice before the parent's :submitting prop round-trips back down.
const sent = ref(false)

function reset() {
  sentence.value = ''
  showErrorBlock.value = false
  errorNote.value = ''
  errorDimension.value = null
}

// Clear the input ONLY when the context actually advances — i.e. a confirmed
// save. On a failed save progress is unchanged, so the learner's sentence (and
// any error note) is preserved for an immediate retry. This is the core of the
// data-loss fix: the card no longer wipes its state the instant submit fires.
watch(
  () => props.progress,
  () => {
    reset()
    sent.value = false
  },
)
// Re-open the actions once an in-flight save resolves. Success advances progress
// (handled above); this falling edge covers the failure path so the buttons
// don't stay disabled after a retryable error.
watch(
  () => props.submitting,
  (now, prev) => {
    if (prev && !now) sent.value = false
  },
)

function fire(payload: SubmitPayload) {
  if (sent.value || props.submitting) return
  sent.value = true
  emit('submit', payload)
}

function onEasy() {
  const text = sentence.value.trim()
  if (!text) return
  fire({
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'easy',
    errorNote: null,
    errorDimension: null,
  })
}
function onHard() {
  if (!sentence.value.trim()) return
  showErrorBlock.value = true
}
function onSaveWithNote() {
  const text = sentence.value.trim()
  if (!text) return
  fire({
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'hard',
    errorNote: errorNote.value.trim(),
    errorDimension: errorDimension.value,
  })
}
function onSkipNote() {
  const text = sentence.value.trim()
  if (!text) return
  fire({
    pickIndex: props.pickIndex,
    sentence: text,
    feedback: 'hard',
    errorNote: null,
    errorDimension: errorDimension.value,
  })
}
</script>

<template>
  <!-- gold = "the action happens here"; jade is reserved for success states -->
  <Card accent="gold">
    <div class="header">
      <div class="ko">{{ grammar.ko }}</div>
      <Badge size="md">
        <MasteryIcon :level="masteryLevel" :size="12" />
        <span>{{ t(masteryInfo.labelKey) }}</span>
      </Badge>
    </div>
    <div class="meaning">{{ tl(grammar.meaning) }}</div>
    <div v-if="grammar.example" class="example-block">
      <button
        type="button"
        class="example-toggle"
        :aria-expanded="showExample"
        @click="showExample = !showExample"
      >
        {{ showExample ? t('practice.hide_example') : t('practice.show_example') }}
      </button>
      <div v-if="showExample" class="example-reveal">
        <div class="example">{{ grammar.example }}</div>
        <div v-if="grammar.trans" class="trans">{{ tl(grammar.trans) }}</div>
      </div>
    </div>

    <ProgressDots :total="3" :progress="progress" />
    <ContextDisplay :context="context" />
    <SentenceInput v-model="sentence" />
    <FeedbackRow :disabled="!sentence.trim() || sent || submitting" @easy="onEasy" @hard="onHard" />
    <ErrorNoteBlock
      v-if="showErrorBlock"
      v-model="errorNote"
      v-model:dimension="errorDimension"
      :disabled="sent || submitting"
      @save="onSaveWithNote"
      @skip="onSkipNote"
    />
  </Card>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
}
.ko {
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  font-size: 24px;
  color: var(--ink);
}
.meaning {
  font-family: 'Inter', sans-serif;
  color: var(--ink-soft);
  margin: 8px 0 12px;
  font-size: 15px;
}
.example-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}
/* Deliberately a quiet, secondary affordance (dashed, ink-soft, Inter) — it's
 * an opt-in hint, not a primary action competing with the sentence input. */
.example-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  color: var(--ink-soft);
  background: transparent;
  border: 2px dashed var(--border-strong);
  cursor: pointer;
  transition:
    background-color var(--motion-quick) var(--ease-out),
    color var(--motion-quick) var(--ease-out);
}
.example-toggle:hover {
  background: var(--surface);
  color: var(--ink);
}
.example-toggle:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.example {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 14px;
  color: var(--ink);
}
.trans {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  margin-top: 4px;
}
</style>
